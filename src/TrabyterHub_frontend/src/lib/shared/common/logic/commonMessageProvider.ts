import { MessageRawData } from '$lib/shared/common/abstractions/messages/messageRawData';
import { MessageType } from '$lib/shared/common/abstractions/messages/messagetype';

import { RequestPublicKeyMessage } from '../abstractions/messages/fromAny/requestPublicKeyMessage';
import { ResponsePublicKeyMessage } from '../abstractions/messages/fromAny/responsePublicKeyMessage';
import { MessageCommon } from '../abstractions/messages/messageCommon';
import { AppIdentifier } from '../abstractions/types/commonTypes';
import { CryptoUtils } from '../crypto/cryptoutils';

export interface IMessageProvider
{
    InitAsync(): Promise<void>;

    MessageReceived(targetIdentifier: AppIdentifier, sourceIdentifier: AppIdentifier, messageType: MessageType, messageDataAsJsonString: string): Promise<void>;


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

    constructor(myAppIdentifier: AppIdentifier, allowedOriginUrls: string[], appIdentifierToUrl: Partial<Record<AppIdentifier, string>>)
    {
        this._appIdentifierToUrl = appIdentifierToUrl;
        this.MyAppIdentifier = myAppIdentifier;
        this._allowedOriginUrls = allowedOriginUrls;
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
        console.log('OK. CommonMessageProvider.InitAsync' + this.MyAppIdentifier);
    }

    private async MessageReceivedInternal(event: MessageEvent): Promise<void>
    {
        try
        {
            console.log('MessageProvider.MessageReceived', event);

            if (!this.isOriginAllowed(event.origin, this._allowedOriginUrls))
            {
                console.log('CommonMessageProvider.MessageReceived from origin: ' + event.origin);
                console.log('Allowed origins are: ', this._allowedOriginUrls);
                return;
            }
            // Validate the origin of the message
            // if (event.origin !== window.origin) {
            //     console.warn('Received message from unknown origin:', event.origin);
            //     return;
            // }
            // if (event.data.type === 'REQUEST_DATA') {
            //     // Respond with custom data
            //     event.source.postMessage({ type: 'RESPONSE_DATA', requestId: event.data.requestId, payload: 'your data' }, event.origin);
            // }
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

            if (messageData.Type === MessageType.PublicKeyResponse)
            {

                const originalMessage: ResponsePublicKeyMessage = MessageCommon.fromString<ResponsePublicKeyMessage>
                    (messageData.DataAsJsonStringOrEncryptedData)!;

                const importedKey = await CryptoUtils.jwkStringToPublicKey(originalMessage.publicKey);

                // Add the imported public key to the dictionary
                CryptoUtils.AddPublicKeyToDictionary(originalMessage.senderSource, importedKey);
            }
            else if (messageData.Type === MessageType.PublicKeyRequest)
            {
                console.log('Received PublicKeyRequest from:', messageData.SourceIdentifier);

                await this.SendPublicKeyResponse(messageData.SourceIdentifier);
            }
            else
            {
                await this.MessageReceived(
                    messageData.TargetIdentifier,
                    messageData.SourceIdentifier,
                    messageData.Type,
                    messageData.DataAsJsonStringOrEncryptedData,
                );
            }
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


    public async PostMessage<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageData: T,
        encrypted: boolean = true,
        messageId: string | null = null,

    )
    {

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
        }
        else
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

            let messageRawDataString: string = await this.GetRawMessageDataString
                (
                    targetIdentifier, sourceIdentifier, messageType,
                    messageData, encrypted, messageId,
                );

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

    private async GetRawMessageDataString<T>
        (
            targetIdentifier: AppIdentifier,
            sourceIdentifier: AppIdentifier,
            messageType: MessageType,
            messageData: T,
            encrypted: boolean = true,
            messageId: string | null = null
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
        }
        catch (e)
        {
            console.error('Error serializing message data to string:', e);
            return '';
        }
    }


    // PostMessageEncryptedToParent<T>(messageType: MessageType, messageData: T, id: string | null = null) {
    //     try {
    //         var messageRawData: MessageRawData = CryptoUtils.EncryptAndReturnAsRawMessageAsync(
    //             messageData,
    //             messageType,
    //             id,
    //         );PostMessageToChild

    //         window.parent.postMessage({type: messageType, data: messageRawData.toString()}, '*');
    //     } catch (e) {
    //         console.error('Error sending message to host:', e);
    //     }
    // }

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
        var message = new ResponsePublicKeyMessage(targetIdentifier, this.MyAppIdentifier, CryptoUtils.MyPublicKey);

        console.log("I method 'SendPublicKeyResponse', my public key:", CryptoUtils.MyPublicKey);

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
