import {CryptoUtils} from '../../crypto/cryptoutils';
import {AppIdentifier} from '../types/commonTypes';
import {MessageType} from './messagetype';

export class MessageRawData {
    public MessageId: string;
    public Type: MessageType;
    public data: string;
    public TargetIdentifier: AppIdentifier = AppIdentifier.Unknown;
    public SourceIdentifier: AppIdentifier = AppIdentifier.Unknown;
    public EncryptedKey?: string;
    public Iv?: string;
    public IsDataEncrypted: boolean = false;

    constructor(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,

        type: MessageType,
        data: string,
        messageId: string | null = null,
    ) {
        this.TargetIdentifier = targetIdentifier;
        this.SourceIdentifier = sourceIdentifier;
        if (messageId !== null) {
            this.MessageId = messageId ? messageId : MessageRawData.generateUUID();
        } else {
            this.MessageId = '';
        }

        this.Type = type;
        this.data = data;
    }

    private static generateUUID(): string {
        // Use the browser's crypto.randomUUID if available
        if (
            typeof globalThis !== 'undefined' &&
            (globalThis as any).crypto &&
            typeof (globalThis as any).crypto.randomUUID === 'function'
        ) {
            return (globalThis as any).crypto.randomUUID();
        }

        // Fallback: generate RFC4122 v4 UUID using getRandomValues
        const bytes = new Uint8Array(16);
        if ((globalThis as any).crypto && typeof (globalThis as any).crypto.getRandomValues === 'function') {
            (globalThis as any).crypto.getRandomValues(bytes);
        } else {
            // Last resort fallback using Math.random (not cryptographically secure)
            for (let i = 0; i < 16; i++) {
                bytes[i] = Math.floor(Math.random() * 256);
            }
        }
        // Per RFC4122 v4
        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const toHex = (num: number) => num.toString(16).padStart(2, '0');
        const parts = [
            [...bytes.slice(0, 4)].map(toHex).join(''),
            [...bytes.slice(4, 6)].map(toHex).join(''),
            [...bytes.slice(6, 8)].map(toHex).join(''),
            [...bytes.slice(8, 10)].map(toHex).join(''),
            [...bytes.slice(10, 16)].map(toHex).join(''),
        ];
        return `${parts[0]}-${parts[1]}-${parts[2]}-${parts[3]}-${parts[4]}`;
    }

    public async GetInternalDataStringAsync(): Promise<string> {
        if (this.IsDataEncrypted == false) {
            return this.data;
        } else {
            var tempJson: string = await CryptoUtils.DecryptStringAsync(
                this.EncryptedKey ? this.EncryptedKey : '',
                this.Iv ? this.Iv : '',
                this.data,
            );
            return tempJson;
        }
    }

    public toString(): string {
        return JSON.stringify(this);
    }

    public static fromString(jsonString: string | any): MessageRawData {
        try {
            // Accept either a JSON string or an already-parsed object
            const parsed: any = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;

            const type: MessageType = parsed?.Type ?? MessageType.Unknown;
            const data: string = parsed?.data ?? '';
            const messageId: string | null = parsed?.MessageId ?? null;
            const targetIdentifier: AppIdentifier = parsed?.TargetIdentifier ?? AppIdentifier.Unknown;
            const sourceIdentifier: AppIdentifier = parsed?.SourceIdentifier ?? AppIdentifier.Unknown;

            const msg = new MessageRawData(targetIdentifier, sourceIdentifier, type, data, messageId);
            msg.EncryptedKey = parsed?.EncryptedKey;
            msg.Iv = parsed?.Iv;
            msg.IsDataEncrypted = parsed?.IsDataEncrypted ?? false;

            return msg;
        } catch (e) {
            console.error('Error parsing MessageData from string:', e);
            return new MessageRawData(AppIdentifier.Unknown, AppIdentifier.Unknown, MessageType.Unknown, '', '');
        }
    }
}
