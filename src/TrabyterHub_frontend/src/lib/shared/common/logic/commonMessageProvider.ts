import { MessageRawData } from '$lib/shared/common/abstractions/messages/messageRawData';
import { MessageType } from '$lib/shared/common/abstractions/messages/messagetype';

import { RequestPublicKeyMessage } from '../abstractions/messages/fromAny/requestPublicKeyMessage';
import { RequestWalletStatusMessage } from '../abstractions/messages/fromAny/RequestWalletStatusMessage';
import { ResponsePublicKeyMessage } from '../abstractions/messages/fromAny/responsePublicKeyMessage';
import { ResponseWalletStatusMessage } from '../abstractions/messages/fromAny/ResponseWalletStatusMessage';
import { MessageCommon } from '../abstractions/messages/messageCommon';
import { AppIdentifier } from '../abstractions/types/commonTypes';
import { CryptoUtils } from '../crypto/cryptoutils';
import { NonceTracker } from '../security/nonceTracker';
import { RateLimiter } from '../security/rateLimiter';
import { TrustedAppRegistry } from '../security/trustedAppRegistry';

export interface IMessageProvider
{
    InitAsync(): Promise<void>;

    MessageReceived(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageDataAsJsonString: string,
    ): Promise<void>;
}

function isBrowser(): boolean
{
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

export class CommonMessageProvider
{
    public MyAppIdentifier: AppIdentifier;
    private _allowedOriginUrls: string[];
    private _appIdentifierToUrl: Partial<Record<AppIdentifier, string>>;
    private _rateLimiter: RateLimiter;
    private _nonceTracker: NonceTracker;
    private _immediateMessages: Map<string, MessageCommon<any>> = new Map<string, MessageCommon<any>>();

    constructor(
        myAppIdentifier: AppIdentifier,
        allowedOriginUrls: string[],
        appIdentifierToUrl: Partial<Record<AppIdentifier, string>>,
    )
    {
        this._appIdentifierToUrl = appIdentifierToUrl;
        this.MyAppIdentifier = myAppIdentifier;
        this._allowedOriginUrls = allowedOriginUrls;
        this._rateLimiter = new RateLimiter();
        this._nonceTracker = new NonceTracker();
        if (isBrowser())
        {
            window.removeEventListener('message', async (event) => await this.MessageReceivedInternal(event));
            window.addEventListener('message', async (event) => await this.MessageReceivedInternal(event));
        }
    }

    public async InitAsync(): Promise<void>
    {
        console.log('CommonMessageProvider.InitAsync' + this.MyAppIdentifier);
        await CryptoUtils.InitAsync(this.MyAppIdentifier);

        // If this is a child app (embedded in iframe), request parent's public key
        if (isBrowser() && window.parent && window.parent !== window)
        {
            console.log('Child app detected - requesting parent (MainWebsite) public key');

            // Send our keys first, then request parent's keys
            await this.SendPublicKeyResponse(AppIdentifier.MainWebsite);
            await this.SendPublicKeyRequest(AppIdentifier.MainWebsite);

            // Wait for key exchange to complete before proceeding
            await this.waitForKeyExchange(AppIdentifier.MainWebsite);
        }

        console.log('OK. CommonMessageProvider.InitAsync' + this.MyAppIdentifier);
    }

    private async ClearOldImmediateMessages(): Promise<void>
    {
        const now: bigint = BigInt(Date.now());
        const expirationTimeMs: bigint = BigInt(5 * 60 * 1000); // 5 minutes
        for (const [messageId, message] of this._immediateMessages)
        {
            if (now - message.TimeStamp > expirationTimeMs)
            {
                this._immediateMessages.delete(messageId);
                console.log(`Cleared old immediate message: ${messageId}`);
            }
        }
    }

    private async MessageReceivedInternal(event: MessageEvent): Promise<void>
    {
        try
        {
            console.log('MessageProvider.MessageReceived', event);

            // Clear old immediate messages
            await this.ClearOldImmediateMessages();

            if (!this.isOriginAllowed(event.origin, this._allowedOriginUrls))
            {
                console.log('CommonMessageProvider.MessageReceived from origin: ' + event.origin);
                console.log('Allowed origins are: ', this._allowedOriginUrls);
                return;
            }

            if (!event.data || !event.data.type || !event.data.data)
            {
                console.warn('Received malformed message:', event.data);
                return;
            }
            const messageDataOrNull: MessageRawData | null = await MessageRawData.fromString(event.data.data);
            if (messageDataOrNull === null)
            {
                console.error('Failed to parse MessageRawData from event data.');
                return;
            }
            const messageData: MessageRawData = messageDataOrNull!;
            console.log('Parsed MessageData:', messageData);

            if (messageData.TargetIdentifier !== this.MyAppIdentifier)
            {
                return;
            }

            // Check rate limit before processing (DoS protection)
            if (!this._rateLimiter.checkRateLimit(messageData.SourceIdentifier))
            {
                console.error(`❌ Rate limit exceeded for ${messageData.SourceIdentifier} - message rejected`);
                const stats = this._rateLimiter.getStatistics(messageData.SourceIdentifier);
                console.error(`Stats: ${stats.messagesLastSecond}/sec, ${stats.messagesLastMinute}/min`);
                return;
            }

            // Handle public key exchange (before signature verification since we don't have keys yet)
            if (messageData.Type === MessageType.PublicKeyResponse)
            {
                await this.processPublicKeyResponse(event, messageData);
                return;
            } else if (messageData.Type === MessageType.PublicKeyRequest)
            {
                console.log('Received PublicKeyRequest from:', messageData.SourceIdentifier);

                // Send our public keys to the requester
                await this.SendPublicKeyResponse(messageData.SourceIdentifier);

                // Also request the sender's keys if we don't have them yet
                const senderSigningKey = CryptoUtils.GetSigningPublicKey(messageData.SourceIdentifier);
                if (!senderSigningKey)
                {
                    console.log('Requesting public keys from:', messageData.SourceIdentifier);
                    await this.SendPublicKeyRequest(messageData.SourceIdentifier);
                }

                return;
            }

            // Get sender's signing public key for verification
            const senderSigningPublicKey = CryptoUtils.GetSigningPublicKey(messageData.SourceIdentifier);

            if (!senderSigningPublicKey)
            {
                console.error('No signing public key available for sender:', messageData.SourceIdentifier);
                console.warn('Message rejected - missing signing key. Key exchange required first.');
                return;
            }

            // Verify message signature (BEFORE decryption - signature is on encrypted data)
            // IMPORTANT: Signature verification MUST happen before nonce check to prevent
            // memory pollution from forged messages. Only authenticated messages should
            // have their nonces recorded.
            const isValid = await messageData.VerifySignature(senderSigningPublicKey);
            if (!isValid)
            {
                console.error('❌ Message signature verification FAILED for:', messageData.SourceIdentifier);
                console.error('Possible tampering, replay attack, or message too old');
                return;
            }

            console.log('✅ Message signature verified for:', messageData.SourceIdentifier);

            // Check nonce for replay attack prevention (AFTER signature verification)
            // This prevents attackers from polluting the nonce tracker with forged messages
            if (!this._nonceTracker.checkAndRecordNonce(messageData.SourceIdentifier, messageData.Nonce))
            {
                console.error(`❌ Duplicate nonce detected from ${messageData.SourceIdentifier} - REPLAY ATTACK!`);
                return;
            }

            // Now decrypt the message (signature verified, safe to decrypt)
            await messageData.DecryptData();

            if (messageData.Type === MessageType.ResponseWalletStatus)
            {
                const walletStatusMessage: ResponseWalletStatusMessage =
                    MessageCommon.fromString<ResponseWalletStatusMessage>(messageData.DataAsJsonStringOrEncryptedData)!;
                if (walletStatusMessage.ImmediateResponseRequested == true)
                {
                    this._immediateMessages.set(messageData.MessageId, walletStatusMessage);
                    console.log('Stored immediate wallet status message:', messageData.MessageId);
                }
                return;
            }

            // Process authenticated and decrypted message
            await this.MessageReceived(
                messageData.TargetIdentifier,
                messageData.SourceIdentifier,
                messageData.Type,
                messageData.DataAsJsonStringOrEncryptedData,
            );
        } catch (e)
        {
            console.error('Error processing received message:', e);
        }
    }

    protected async MessageReceived(
        _targetIdentifier: AppIdentifier,
        _sourceIdentifier: AppIdentifier,
        _messageType: MessageType,
        _messageDataAsJsonString: string,
    ): Promise<void>
    {
        // This method is intended to be overridden by derived classes
    }

    private async processPublicKeyResponse(event: MessageEvent, messageData: MessageRawData): Promise<void>
    {
        const originalMessage: ResponsePublicKeyMessage = MessageCommon.fromString<ResponsePublicKeyMessage>(
            messageData.DataAsJsonStringOrEncryptedData,
        )!;

        // Verify the app is trusted and origin is allowed
        if (!TrustedAppRegistry.isAppTrusted(originalMessage.senderSource, event.origin))
        {
            console.error(
                `❌ Rejected public key from untrusted source: ${originalMessage.senderSource} @ ${event.origin}`,
            );
            return;
        }

        // Import encryption public key
        const importedKey = await CryptoUtils.jwkStringToPublicKey(originalMessage.publicKey);

        // Verify encryption key fingerprint (MITM protection)
        const encryptionKeyValid = await TrustedAppRegistry.verifyPublicKeyFingerprint(
            originalMessage.senderSource,
            importedKey,
            'encryption',
        );

        if (!encryptionKeyValid)
        {
            console.error(
                `❌ SECURITY: Encryption key fingerprint verification FAILED for ${originalMessage.senderSource}`,
            );
            console.error(`❌ Possible MITM attack - public key has been substituted!`);
            return;
        }

        CryptoUtils.AddPublicKeyToDictionary(originalMessage.senderSource, importedKey);

        // Import signing public key
        const importedSigningKey = await CryptoUtils.jwkStringToSigningPublicKey(originalMessage.signingPublicKey);

        // Verify signing key fingerprint (MITM protection)
        const signingKeyValid = await TrustedAppRegistry.verifyPublicKeyFingerprint(
            originalMessage.senderSource,
            importedSigningKey,
            'signing',
        );

        if (!signingKeyValid)
        {
            console.error(
                `❌ SECURITY: Signing key fingerprint verification FAILED for ${originalMessage.senderSource}`,
            );
            console.error(`❌ Possible MITM attack - signing key has been substituted!`);
            return;
        }

        CryptoUtils.AddSigningPublicKeyToDictionary(originalMessage.senderSource, importedSigningKey);

        console.log('✅ Public keys imported and fingerprints verified for:', originalMessage.senderSource);
    }

    // Helper method to wait for key exchange completion
    protected async waitForKeyExchange(targetIdentifier: AppIdentifier, timeoutMs: number = 5000): Promise<boolean>
    {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs)
        {
            const encryptionKey = CryptoUtils.GetPublicKey(targetIdentifier);
            const signingKey = CryptoUtils.GetSigningPublicKey(targetIdentifier);

            if (encryptionKey && signingKey)
            {
                console.log('✅ Key exchange completed for:', targetIdentifier);
                return true;
            }

            // Wait 100ms before checking again
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.warn('⚠️ Key exchange timeout for:', targetIdentifier);
        return false;
    }

    // Helper method to check if keys are available before sending encrypted messages
    public hasKeysFor(targetIdentifier: AppIdentifier): boolean
    {
        const encryptionKey = CryptoUtils.GetPublicKey(targetIdentifier);
        const signingKey = CryptoUtils.GetSigningPublicKey(targetIdentifier);
        return !!(encryptionKey && signingKey);
    }

    public async PostMessage<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageData: T,
        encrypted: boolean = true,
        messageId: string | null = null,
    )
    {
        // If encryption is requested but keys aren't available, either wait or send unencrypted
        if (encrypted && !this.hasKeysFor(targetIdentifier))
        {
            console.warn(`No keys available for ${targetIdentifier}. Attempting key exchange...`);

            // Try to request keys and wait briefly
            await this.SendPublicKeyRequest(targetIdentifier);
            const success = await this.waitForKeyExchange(targetIdentifier, 2000);

            if (!success)
            {
                console.error(`Failed to obtain keys for ${targetIdentifier}. Message not sent.`);
                return;
            }
        }

        if (targetIdentifier === AppIdentifier.MainWebsite)
        {
            await this.PostMessageToParent(
                targetIdentifier,
                sourceIdentifier,
                messageType,
                messageData,
                encrypted,
                messageId,
            );
        } else
        {
            await this.PostMessageToChild(
                targetIdentifier,
                sourceIdentifier,
                messageType,
                messageData,
                encrypted,
                messageId,
            );
        }
    }

    public async PostMessageToParent<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageData: T,
        encrypted: boolean = true,
        messageId: string | null = null,
    )
    {
        try
        {
            if (!isBrowser())
            {
                console.warn('Not in browser environment. Cannot post message to parent.');
                return;
            }

            // Check if we're actually in an iframe
            if (!window.parent || window.parent === window)
            {
                console.warn('Not embedded in iframe. Cannot post message to parent.');
                return;
            }

            let messageRawDataString: string = await this.GetRawMessageDataString(
                targetIdentifier,
                sourceIdentifier,
                messageType,
                messageData,
                encrypted,
                messageId,
            );

            // Check if message serialization failed
            if (!messageRawDataString)
            {
                console.error('Failed to serialize message data. Message not sent.');
                return;
            }

            let originTarget: string = this._appIdentifierToUrl[targetIdentifier]!;

            // Validate origin format
            if (!originTarget || originTarget === '*')
            {
                console.error('Invalid or insecure target origin:', originTarget);
                return;
            }

            // Ensure origin doesn't include path
            try
            {
                const url = new URL(originTarget);
                originTarget = `${url.protocol}//${url.host}`;
            } catch (e)
            {
                console.error('Invalid origin URL:', originTarget, e);
                return;
            }

            window.parent.postMessage({ type: messageType, data: messageRawDataString }, originTarget);
        } catch (e)
        {
            console.error('Error sending message to host:', e);
        }
    }

    /// Sends a message from parent to a specific embedded child app (iframe)
    public async PostMessageToChild<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageData: T,
        encrypted: boolean = true,
        messageId: string | null = null,
    )
    {
        try
        {
            let messageRawDataString: string = await this.GetRawMessageDataString(
                targetIdentifier,
                sourceIdentifier,
                messageType,
                messageData,
                encrypted,
                messageId,
            );

            // Check if message serialization failed
            if (!messageRawDataString)
            {
                console.error('Failed to serialize message data. Message not sent.');
                return;
            }

            console.log('Posting message to child app:', targetIdentifier);
            console.log('Message raw data:', messageRawDataString);

            // Find the iframe element for the target app identifier
            const iframeSelector = `iframe[data-app-id="${targetIdentifier}"]`;
            const iframe = document.querySelector(iframeSelector) as HTMLIFrameElement;

            if (!iframe || !iframe.contentWindow)
            {
                console.error('Child app iframe not found for identifier:', targetIdentifier);
                return;
            }

            let originTarget: string = this._appIdentifierToUrl[targetIdentifier]!;

            // Validate origin format
            if (!originTarget || originTarget === '*')
            {
                console.error('Invalid or insecure target origin:', originTarget);
                return;
            }

            // Ensure origin doesn't include path
            try
            {
                const url = new URL(originTarget);
                originTarget = `${url.protocol}//${url.host}`;
            } catch (e)
            {
                console.error('Invalid origin URL:', originTarget, e);
                return;
            }

            // Send a message to the child iframe
            iframe.contentWindow.postMessage({ type: messageType, data: messageRawDataString }, originTarget);
        } catch (e)
        {
            console.error('Error sending message to child app:', e);
        }
    }

    private async GetRawMessageDataString<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageData: T,
        encrypted: boolean = true,
        messageId: string | null = null,
    ): Promise<string>
    {
        try
        {
            let messageRawData: MessageRawData = new MessageRawData();
            await messageRawData.Init(
                targetIdentifier,
                sourceIdentifier,
                messageType,
                messageData,
                encrypted,
                messageId,
            );
            return messageRawData.toString();
        } catch (e)
        {
            console.error('Error serializing message data to string:', e);
            return '';
        }
    }

    // Sends a request for wallet info and waits for the response
    public async SendRequestWalletInfoMessageAsync(): Promise<ResponseWalletStatusMessage | null>
    {
        var messageId: string = CryptoUtils.generateUUID();

        var requestMessage = new RequestWalletStatusMessage();
        requestMessage.ImmediateResponseRequested = true;

        await this.PostMessage<RequestWalletStatusMessage>(
            AppIdentifier.MainWebsite,
            this.MyAppIdentifier,
            MessageType.RequestWalletStatus,
            requestMessage,
            true,
            messageId,
        );

        const responseMessage = await this.WaitForImmediateMessageReceived<ResponseWalletStatusMessage>(
            messageId,
            5000,
        );
        var result: ResponseWalletStatusMessage = responseMessage as ResponseWalletStatusMessage;
        return result ? result : null;
    }

    // Waits for an immediate response message with the specified messageId
    private async WaitForImmediateMessageReceived<T>(
        messageId: string,
        timeoutMs: number = 5000,
    ): Promise<MessageCommon<T> | null>
    {
        const startTime = Date.now();

        while (Date.now() - startTime < timeoutMs)
        {
            if (this._immediateMessages.has(messageId))
            {
                const message = this._immediateMessages.get(messageId)!;
                this._immediateMessages.delete(messageId);
                return message as MessageCommon<T>;
            }

            // Wait 100ms before checking again
            await new Promise((resolve) => setTimeout(resolve, 100));
        }

        console.warn('⚠️ Immediate message wait timeout for messageId:', messageId);
        return null;
    }

    // Sends a public key request message to the parent window
    public async SendPublicKeyRequest(targetIdentifier: AppIdentifier)
    {
        console.log('MessageProvider.SendPublicKeyRequest');

        var message = new RequestPublicKeyMessage();

        // Send to parent only
        if (targetIdentifier === AppIdentifier.MainWebsite)
        {
            await this.PostMessageToParent(
                targetIdentifier,
                this.MyAppIdentifier,
                MessageType.PublicKeyRequest,
                message,
                false,
            );
        } else
        {
            await this.PostMessageToChild(
                targetIdentifier,
                this.MyAppIdentifier,
                MessageType.PublicKeyRequest,
                message,
                false,
            );
        }
    }

    public async SendPublicKeyResponse(targetIdentifier: AppIdentifier)
    {
        var message = new ResponsePublicKeyMessage(
            targetIdentifier,
            this.MyAppIdentifier,
            CryptoUtils.MyPublicKey,
            CryptoUtils.MySigningPublicKey,
        );

        console.log("In method 'SendPublicKeyResponse'");
        console.log('  - Encryption public key:', CryptoUtils.MyPublicKey);
        console.log('  - Signing public key:', CryptoUtils.MySigningPublicKey);

        await this.PostMessage<ResponsePublicKeyMessage>(
            targetIdentifier,
            this.MyAppIdentifier,
            MessageType.PublicKeyResponse,
            message,
            false,
        );
    }

    // Add this new method for secure origin validation
    public isOriginAllowed(eventOrigin: string, allowedOriginUrls: string[]): boolean
    {
        if (!eventOrigin)
        {
            return false;
        }

        try
        {
            // Normalize the event origin
            const eventUrl = new URL(eventOrigin);
            const normalizedEventOrigin = `${eventUrl.protocol}//${eventUrl.host}`.toLowerCase();

            // Check against each allowed origin
            return allowedOriginUrls.some((allowedOrigin) =>
            {
                try
                {
                    const allowedUrl = new URL(allowedOrigin);
                    const normalizedAllowedOrigin = `${allowedUrl.protocol}//${allowedUrl.host}`.toLowerCase();
                    return normalizedEventOrigin === normalizedAllowedOrigin;
                } catch (error)
                {
                    console.warn('Invalid allowed origin URL:', allowedOrigin);
                    return false;
                }
            });
        } catch (error)
        {
            console.warn('Invalid event origin:', eventOrigin);
            return false;
        }
    }
}
