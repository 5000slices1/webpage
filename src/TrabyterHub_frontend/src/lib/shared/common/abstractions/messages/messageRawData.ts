import { CryptoUtils } from '../../crypto/cryptoutils';
import { AppIdentifier } from '../types/commonTypes';
import { MessageType } from './messagetype';

export class MessageRawData
{
    public MessageId: string;
    public Type: MessageType;

    /// Either the raw JSON string or the encrypted data string
    public DataAsJsonStringOrEncryptedData: string;
    public TargetIdentifier: AppIdentifier = AppIdentifier.Unknown;
    public SourceIdentifier: AppIdentifier = AppIdentifier.Unknown;

    /// This is the AES symmetric key that has been encrypted with RSA-OAEP using the recipient's public key.
    /// This is safe to raw transmit as only the recipient can decrypt it with their private key.
    public EncryptedKey?: string;

    /// This is the initialization vector (IV) used for AES encryption.
    public Iv?: string;

    public IsDataEncrypted: boolean = false;

    /// Digital signature for message authentication (prevents impersonation)
    public Signature?: string;

    /// Unix timestamp in milliseconds (prevents replay attacks)
    public Timestamp: number;

    /// Random value to ensure message uniqueness (prevents replay attacks)
    public Nonce: string;

    constructor()
    {
        this.DataAsJsonStringOrEncryptedData = '';
        this.Type = MessageType.Unknown;
        this.MessageId = '';
        this.Timestamp = Date.now();
        this.Nonce = this.generateNonce();
    }

    private generateNonce(): string
    {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    public async Init<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        type: MessageType,
        message: T,
        shoudBeEncrypted: boolean = true,
        messageId: string | null = null,
    )
    {
        this.TargetIdentifier = targetIdentifier;
        this.SourceIdentifier = sourceIdentifier;

        if (messageId !== null)
        {
            this.MessageId = messageId ? messageId : CryptoUtils.generateUUID();
        }
        else
        {
            this.MessageId = '';
        }

        this.Type = type;
        this.IsDataEncrypted = shoudBeEncrypted;

        if (!shoudBeEncrypted)
        {
            this.DataAsJsonStringOrEncryptedData = JSON.stringify(message);
        }
        else
        {
            const jsonString: string = JSON.stringify(message);
            const encryptedData = await CryptoUtils.EncryptStringAsync(jsonString, targetIdentifier);

            this.EncryptedKey = encryptedData.encryptedKey;
            this.Iv = encryptedData.iv;
            this.DataAsJsonStringOrEncryptedData = encryptedData.encryptedData;
        }

        // Sign the message after initialization
        await this.SignMessage();
    }

    /// Sign this message with sender's private key
    public async SignMessage(): Promise<void>
    {
        const messageToSign = this.getCanonicalString();
        this.Signature = await CryptoUtils.SignMessageAsync(messageToSign);
    }

    /// Verify signature using sender's public signing key
    public async VerifySignature(senderSigningPublicKey: CryptoKey): Promise<boolean>
    {
        if (!this.Signature)
        {
            console.warn('Message has no signature');
            return false;
        }

        // Check timestamp to prevent replay attacks (within 5 minutes)
        const fiveMinutes = 5 * 60 * 1000;
        const age = Date.now() - this.Timestamp;

        if (age > fiveMinutes)
        {
            console.warn(`Message too old: ${age}ms (max ${fiveMinutes}ms)`);
            return false;
        }

        if (age < 0)
        {
            console.warn('Message timestamp is in the future');
            return false;
        }

        // Verify the signature
        const messageToVerify = this.getCanonicalString();
        return await CryptoUtils.VerifyMessageAsync(messageToVerify, this.Signature, senderSigningPublicKey);
    }

    /// Get canonical string representation for signing/verification
    private getCanonicalString(): string
    {
        // Include all fields that shouldn't change after signing
        // IMPORTANT: This must use the ENCRYPTED data for encrypted messages
        return `${this.TargetIdentifier}:${this.SourceIdentifier}:${this.Type}:${this.DataAsJsonStringOrEncryptedData}:${this.Timestamp}:${this.Nonce}:${this.MessageId}`;
    }

    /// Decrypt the message data (call AFTER signature verification)
    public async DecryptData(): Promise<void>
    {
        if (this.IsDataEncrypted && this.EncryptedKey && this.Iv)
        {
            const jsonString: string = await CryptoUtils.DecryptStringAsync(
                this.EncryptedKey,
                this.Iv,
                this.DataAsJsonStringOrEncryptedData,
            );
            this.DataAsJsonStringOrEncryptedData = jsonString;
            // Mark as decrypted so we don't decrypt twice
            this.IsDataEncrypted = false;
        }
    }

    public toString(): string
    {
        return JSON.stringify(this);
    }

    public static async fromString(jsonString: string): Promise<MessageRawData | null>
    {
        try
        {
            console.log('Parsing MessageRawData from string:');
            console.log(jsonString);
            const parsed: any = JSON.parse(jsonString);
            console.log('Parsed rawData:', parsed);

            if (parsed == null)
            {
                console.error('Parsed MessageRawData is null');
                return null;
            }

            // Create new instance
            const rawData = new MessageRawData();
            rawData.MessageId = parsed.MessageId ?? '';
            rawData.Type = parsed.Type ?? MessageType.Unknown;
            rawData.DataAsJsonStringOrEncryptedData = parsed.DataAsJsonStringOrEncryptedData ?? '';
            rawData.TargetIdentifier = parsed.TargetIdentifier ?? AppIdentifier.Unknown;
            rawData.SourceIdentifier = parsed.SourceIdentifier ?? AppIdentifier.Unknown;
            rawData.EncryptedKey = parsed.EncryptedKey;
            rawData.Iv = parsed.Iv;
            rawData.IsDataEncrypted = parsed.IsDataEncrypted ?? false;

            // Parse security fields
            rawData.Signature = parsed.Signature;
            rawData.Timestamp = parsed.Timestamp ?? Date.now();
            rawData.Nonce = parsed.Nonce ?? '';

            // DO NOT decrypt here - signature must be verified first using encrypted data
            // Decryption will happen after signature verification

            return rawData;
        } catch (e)
        {
            console.error('Error parsing MessageData from string:', e);
            return null;
        }
    }
}
