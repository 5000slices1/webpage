import { ResponsePublicKeyMessage } from '../abstractions/messages/fromAny/responsePublicKeyMessage';
import { MessageRawData } from '../abstractions/messages/messageRawData';
import { MessageType } from '../abstractions/messages/messagetype';
import { AppIdentifier } from '../abstractions/types/commonTypes';

export class CryptoUtils
{
    //my personal keys
    private static keyPair?: CryptoKeyPair;

    /// Dictionary to hold public keys of other apps and myself
    private static dicPublicKeys: Partial<Record<AppIdentifier, CryptoKey>> = {};
    public static MyPublicKey: string;

    public static async InitAsync(myAppIdentifier: AppIdentifier): Promise<void>
    {
        if (!CryptoUtils.keyPair)
        {
            CryptoUtils.keyPair = await this.generateKeyPairAsync();

            //Add my own public key to the dictionary
            CryptoUtils.dicPublicKeys[myAppIdentifier] = CryptoUtils.keyPair.publicKey;
            CryptoUtils.MyPublicKey = await this.publicKeyToJwkString(CryptoUtils.keyPair.publicKey);
        }
    }

    public static AddPublicKeyToDictionary(appIdentifier: AppIdentifier, publicKey: CryptoKey): void
    {
        if (!CryptoUtils.dicPublicKeys[appIdentifier])
        {
            CryptoUtils.dicPublicKeys[appIdentifier] = publicKey;
        }
    }
    private static async generateKeyPairAsync(): Promise<CryptoKeyPair>
    {
        // Generate a key pair
        return await window.crypto.subtle.generateKey(
            { name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' },
            true,
            ['encrypt', 'decrypt'],
        );
    }

    public static generateUUID(): string
    {
        // Use the browser's crypto.randomUUID if available
        if (
            typeof globalThis !== 'undefined' &&
            (globalThis as any).crypto &&
            typeof (globalThis as any).crypto.randomUUID === 'function'
        )
        {
            return (globalThis as any).crypto.randomUUID();
        }

        // Fallback: generate RFC4122 v4 UUID using getRandomValues
        const bytes = new Uint8Array(16);
        if ((globalThis as any).crypto && typeof (globalThis as any).crypto.getRandomValues === 'function')
        {
            (globalThis as any).crypto.getRandomValues(bytes);
        } else
        {
            // Last resort fallback using Math.random (not cryptographically secure)
            for (let i = 0; i < 16; i++)
            {
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


    public static async EncryptStringAsync(
        input: string,
        targetIdentifier: AppIdentifier,
    ): Promise<{ encryptedKey: string; encryptedData: string; iv: string }>
    {

        const receiversPublicKey: CryptoKey | undefined = CryptoUtils.dicPublicKeys[targetIdentifier];

        if (!receiversPublicKey)
        {
            throw new Error(`No public key available for ${targetIdentifier}. Key exchange required first.`);
        }

        // 1. Generate a random AES key
        const aesKey = await window.crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, [
            'encrypt',
            'decrypt',
        ]);

        // 2. Encrypt the message with AES-GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(input); // Uint8Array
        const encryptedData = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, aesKey, encoded);

        // 3. Export and encrypt the AES key with RSA-OAEP
        const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
        const encryptedKey = await window.crypto.subtle.encrypt({ name: 'RSA-OAEP' }, receiversPublicKey, rawAesKey);

        // 4. Return base64-encoded results (iv:encryptedData)
        const toBase64 = (buf: ArrayBuffer) => btoa(String.fromCharCode(...new Uint8Array(buf)));
        return {
            encryptedKey: toBase64(encryptedKey),
            encryptedData: toBase64(encryptedData),
            iv: toBase64(iv.buffer),
        };
    }

    public static async DecryptStringAsync(
        encryptedKey: string,
        ivValue: string,
        encryptedData: string,
    ): Promise<string>
    {
        if (!CryptoUtils.keyPair)
        {
            throw new Error('Key pair not initialized');
        }
        const receiversPrivateKey: CryptoKey = CryptoUtils.keyPair.privateKey;
        // Helper to decode base64
        const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

        // 1. Decrypt the AES key with receiver's private RSA key
        const aesKeyRaw = await window.crypto.subtle.decrypt(
            { name: 'RSA-OAEP' },
            receiversPrivateKey,
            fromBase64(encryptedKey),
        );
        const aesKey = await window.crypto.subtle.importKey('raw', aesKeyRaw, { name: 'AES-GCM', length: 256 }, false, [
            'decrypt',
        ]);

        // 2. Split iv and encrypted data
        const iv = fromBase64(ivValue);
        const encrypted = fromBase64(encryptedData);

        // 3. Decrypt the message with AES-GCM
        const decrypted = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, aesKey, encrypted);
        const decoded = new TextDecoder().decode(decrypted);
        return decoded;
    }

    public static async publicKeyToJwkString(key: CryptoKey): Promise<string>
    {
        const jwk = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(jwk); // safe to send/serialize
    }

    public static async jwkStringToPublicKey(jwkString: string): Promise<CryptoKey>
    {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey('jwk', jwk, { name: 'RSA-OAEP', hash: 'SHA-256' }, true, ['encrypt']);
    }
}
