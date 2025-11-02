import {ResponsePublicKeyMessage} from '../abstractions/messages/fromAny/responsePublicKeyMessage';
import {MessageRawData} from '../abstractions/messages/messageRawData';
import {MessageType} from '../abstractions/messages/messagetype';
import {AppIdentifier} from '../abstractions/types/commonTypes';

export class CryptoUtils {
    //my personal keys
    private static keyPair?: CryptoKeyPair;

    /// Dictionary to hold public keys of other apps and myself
    public static dicPublicKeys: Partial<Record<AppIdentifier, CryptoKey>> = {};

    public async InitAsync(): Promise<void> {
        if (!CryptoUtils.keyPair) {
            CryptoUtils.keyPair = await this.generateKeyPairAsync();

            //Add my own public key to the dictionary
            CryptoUtils.dicPublicKeys[AppIdentifier.TrabyterStaking] = CryptoUtils.keyPair.publicKey;

            window.removeEventListener('message', async (event) => await CryptoUtils.MessageReceived(event));
        }
        window.addEventListener('message', async (event) => await CryptoUtils.MessageReceived(event));
    }

    private static async MessageReceived(event: MessageEvent) {
        try {
            console.log('MessageProvider.MessageReceived', event);

            // Validate the origin of the message
            // if (event.origin !== window.origin) {
            //     console.warn('Received message from unknown origin:', event.origin);
            //     return;
            // }
            // if (event.data.type === 'REQUEST_DATA') {
            //     // Respond with custom data
            //     event.source.postMessage({ type: 'RESPONSE_DATA', requestId: event.data.requestId, payload: 'your data' }, event.origin);
            // }
            if (!event.data || !event.data.type || !event.data.data) {
                console.warn('Received malformed message:', event.data);
                return;
            }
            const messageData = MessageRawData.fromString(event.data.data);
            console.log('Parsed MessageData:', messageData);
            var internalJsonString: string = await messageData.GetInternalDataStringAsync();
            console.log('Decrypted internal JSON string:', internalJsonString);

            if (event.data.type === MessageType.PublicKeyResponse) {
                console.log('Parsed PublicKeyResponse MessageData:', messageData);
                const originalMessage: ResponsePublicKeyMessage = JSON.parse(internalJsonString);

                const importedKey = await window.crypto.subtle.importKey(
                    'jwk',
                    originalMessage.publicKey as JsonWebKey,
                    {name: 'RSA-OAEP', hash: 'SHA-256'},
                    true,
                    ['encrypt'],
                );

                // Add the imported public key to the dictionary
                CryptoUtils.dicPublicKeys[originalMessage.senderSource] = importedKey;
            }
            // if (event.data.type === MessageType.FullScreenRequest) {
            //     const messageData = MessageRawData.fromString<RequestFullScreenMessage>(event.data.data);
            //     console.log('Parsed MessageData:', messageData);
            //     return;
            // }
        } catch (e) {
            console.error('Error processing received message:', e);
        }
    }

    private async generateKeyPairAsync(): Promise<CryptoKeyPair> {
        // Generate a key pair
        return await window.crypto.subtle.generateKey(
            {name: 'RSA-OAEP', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256'},
            true,
            ['encrypt', 'decrypt'],
        );
    }

    public static async EncryptAndReturnAsRawMessageAsync<T>(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        receiversPublicKey: CryptoKey,
        messageType: MessageType,
        message: T,
        messageId: string | null = null,
    ): Promise<MessageRawData> {
        const jsonString: string = JSON.stringify(message);
        const encryptedData = await this.EncryptStringAsync(jsonString, receiversPublicKey);

        var result = new MessageRawData(
            targetIdentifier,
            sourceIdentifier,
            messageType,
            encryptedData.encryptedData,
            messageId,
        );
        result.EncryptedKey = encryptedData.encryptedKey;
        result.Iv = encryptedData.iv;
        result.IsDataEncrypted = true;

        return result;
    }

    public static async EncryptStringAsync(
        input: string,
        receiversPublicKey: CryptoKey,
    ): Promise<{encryptedKey: string; encryptedData: string; iv: string}> {
        // 1. Generate a random AES key
        const aesKey = await window.crypto.subtle.generateKey({name: 'AES-GCM', length: 256}, true, [
            'encrypt',
            'decrypt',
        ]);

        // 2. Encrypt the message with AES-GCM
        const iv = window.crypto.getRandomValues(new Uint8Array(12));
        const encoded = new TextEncoder().encode(input); // Uint8Array
        const encryptedData = await window.crypto.subtle.encrypt({name: 'AES-GCM', iv}, aesKey, encoded);

        // 3. Export and encrypt the AES key with RSA-OAEP
        const rawAesKey = await window.crypto.subtle.exportKey('raw', aesKey);
        const encryptedKey = await window.crypto.subtle.encrypt({name: 'RSA-OAEP'}, receiversPublicKey, rawAesKey);

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
    ): Promise<string> {
        if (!CryptoUtils.keyPair) {
            throw new Error('Key pair not initialized');
        }
        const receiversPrivateKey: CryptoKey = CryptoUtils.keyPair.privateKey;
        // Helper to decode base64
        const fromBase64 = (b64: string) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

        // 1. Decrypt the AES key with receiver's private RSA key
        const aesKeyRaw = await window.crypto.subtle.decrypt(
            {name: 'RSA-OAEP'},
            receiversPrivateKey,
            fromBase64(encryptedKey),
        );
        const aesKey = await window.crypto.subtle.importKey('raw', aesKeyRaw, {name: 'AES-GCM', length: 256}, false, [
            'decrypt',
        ]);

        // 2. Split iv and encrypted data
        //const [ivB64, encryptedDataB64] = encryptedData.split(':');
        //const iv = fromBase64(ivB64);
        //const encrypted = fromBase64(encryptedDataB64);

        const iv = fromBase64(ivValue);
        const encrypted = fromBase64(encryptedData);

        // 3. Decrypt the message with AES-GCM
        const decrypted = await window.crypto.subtle.decrypt({name: 'AES-GCM', iv}, aesKey, encrypted);
        const decoded = new TextDecoder().decode(decrypted);
        return decoded;
    }

    public static async publicKeyToJwkString(key: CryptoKey): Promise<string> {
        const jwk = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(jwk); // safe to send/serialize
    }

    public static async jwkStringToPublicKey(jwkString: string): Promise<CryptoKey> {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey('jwk', jwk, {name: 'RSA-OAEP', hash: 'SHA-256'}, true, ['encrypt']);
    }
}
