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

    constructor()
    {
        this.DataAsJsonStringOrEncryptedData = '';
        this.Type = MessageType.Unknown;
        this.MessageId = '';
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
            var result = new MessageRawData();
            result.EncryptedKey = encryptedData.encryptedKey;
            result.Iv = encryptedData.iv;
            this.DataAsJsonStringOrEncryptedData = encryptedData.encryptedData;
        }


    }



    // /// Decrypts and returns the internal data json-string
    // public async GetInternalDataJsonString(): Promise<string>
    // {
    //     if (this.IsDataEncrypted == false)
    //     {
    //         return this.DataAsJsonStringOrEncryptedData;
    //     } else
    //     {
    //         var jsonString: string = await CryptoUtils.DecryptStringAsync(
    //             this.EncryptedKey ? this.EncryptedKey : '',
    //             this.Iv ? this.Iv : '',
    //             this.DataAsJsonStringOrEncryptedData,
    //         );
    //         return jsonString;
    //     }
    // }

    public toString(): string
    {
        return JSON.stringify(this);
    }

    public static async fromString(jsonString: string): Promise<MessageRawData | null>
    {
        try
        {

            const rawData: MessageRawData = JSON.parse(jsonString);

            if (rawData == null)
            {
                console.error('Parsed MessageRawData is null');
                return null;
            }

            if (rawData.IsDataEncrypted == true)
            {
                const jsonString: string = await CryptoUtils.DecryptStringAsync(
                    rawData.EncryptedKey!,
                    rawData.Iv!,
                    rawData.DataAsJsonStringOrEncryptedData,
                );
                rawData.DataAsJsonStringOrEncryptedData = jsonString;
            }

            return rawData;

        } catch (e)
        {
            console.error('Error parsing MessageData from string:', e);
            return null;
        }
    }
}
