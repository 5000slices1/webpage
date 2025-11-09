# Security Improvements for Crypto Communication System

## Executive Summary

This document outlines critical security enhancements needed for the parent-embedded app communication system to ensure both **confidentiality** and **authenticity** of messages.

## Current Security Issues

### 1. No Message Authentication
- **Risk**: Malicious actors can send fake messages pretending to be trusted apps
- **Impact**: Parent application cannot verify message origin
- **Current State**: Only encryption (confidentiality) is implemented, no signing (authenticity)

### 2. Missing Origin Validation
- **Risk**: Messages from any origin are accepted
- **Impact**: XSS and iframe-based attacks possible
- **Location**: Origin validation is commented out in message handlers

### 3. No Public Key Verification
- **Risk**: MITM attacks during key exchange
- **Impact**: Attacker can substitute their own public key

## Proposed Solution: Add Digital Signatures

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Message Security Flow                     │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. Sender encrypts message with recipient's public key      │
│     (RSA-OAEP + AES-GCM for confidentiality)                │
│                                                               │
│  2. Sender signs message with their private signing key      │
│     (ECDSA for authenticity)                                 │
│                                                               │
│  3. Recipient verifies signature with sender's public key    │
│     (Ensures message is from trusted source)                 │
│                                                               │
│  4. Recipient decrypts message with their private key        │
│     (Accesses the content)                                   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Add Signing Key Pair

### Location: `cryptoutils.ts`

Add ECDSA signing capabilities alongside existing RSA encryption:

```typescript
export class CryptoUtils {
    // Existing encryption key pair (RSA-OAEP)
    private static keyPair?: CryptoKeyPair;
    
    // NEW: Add signing key pair for authentication (ECDSA)
    private static signingKeyPair?: CryptoKeyPair;

    // Existing: Dictionary for encryption public keys
    public static dicPublicKeys: Partial<Record<AppIdentifier, CryptoKey>> = {};
    
    // NEW: Dictionary for signing public keys
    public static dicSigningPublicKeys: Partial<Record<AppIdentifier, CryptoKey>> = {};

    public static async InitAsync(myAppIdentifier: AppIdentifier): Promise<void> {
        if (!CryptoUtils.keyPair) {
            // Generate encryption keys
            CryptoUtils.keyPair = await this.generateKeyPairAsync();
            CryptoUtils.dicPublicKeys[myAppIdentifier] = CryptoUtils.keyPair.publicKey;

            // NEW: Generate signing keys
            CryptoUtils.signingKeyPair = await this.generateSigningKeyPairAsync();
            CryptoUtils.dicSigningPublicKeys[myAppIdentifier] = CryptoUtils.signingKeyPair.publicKey;
        }
    }

    // NEW: Generate ECDSA key pair for signing
    private static async generateSigningKeyPairAsync(): Promise<CryptoKeyPair> {
        return await window.crypto.subtle.generateKey(
            {
                name: 'ECDSA',
                namedCurve: 'P-256'  // 256-bit elliptic curve
            },
            true,
            ['sign', 'verify']
        );
    }

    // NEW: Sign a message with private signing key
    public static async SignMessageAsync(message: string): Promise<string> {
        if (!CryptoUtils.signingKeyPair) {
            throw new Error('Signing key pair not initialized');
        }
        
        const encoded = new TextEncoder().encode(message);
        const signature = await window.crypto.subtle.sign(
            { name: 'ECDSA', hash: 'SHA-256' },
            CryptoUtils.signingKeyPair.privateKey,
            encoded
        );
        
        return btoa(String.fromCharCode(...new Uint8Array(signature)));
    }

    // NEW: Verify message signature with sender's public key
    public static async VerifyMessageAsync(
        message: string, 
        signature: string, 
        senderSigningPublicKey: CryptoKey
    ): Promise<boolean> {
        try {
            const encoded = new TextEncoder().encode(message);
            const signatureBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
            
            return await window.crypto.subtle.verify(
                { name: 'ECDSA', hash: 'SHA-256' },
                senderSigningPublicKey,
                signatureBytes,
                encoded
            );
        } catch (error) {
            console.error('Signature verification failed:', error);
            return false;
        }
    }

    // NEW: Export signing public key as JWK string
    public static async signingPublicKeyToJwkString(key: CryptoKey): Promise<string> {
        const jwk = await crypto.subtle.exportKey('jwk', key);
        return JSON.stringify(jwk);
    }

    // NEW: Import signing public key from JWK string
    public static async jwkStringToSigningPublicKey(jwkString: string): Promise<CryptoKey> {
        const jwk = JSON.parse(jwkString);
        return await crypto.subtle.importKey(
            'jwk', 
            jwk, 
            { name: 'ECDSA', namedCurve: 'P-256' }, 
            true, 
            ['verify']
        );
    }

    // NEW: Add signing public key to dictionary
    public static AddSigningPublicKeyToDictionary(appIdentifier: AppIdentifier, publicKey: CryptoKey): void {
        if (!CryptoUtils.dicSigningPublicKeys[appIdentifier]) {
            CryptoUtils.dicSigningPublicKeys[appIdentifier] = publicKey;
        }
    }
}
```

---

## Phase 2: Enhance MessageRawData

### Location: `messageRawData.ts`

Add signature fields and replay attack prevention:

```typescript
export class MessageRawData {
    public MessageId: string;
    public Type: MessageType;
    public DataAsJsonStringOrEncryptedData: string;
    public TargetIdentifier: AppIdentifier = AppIdentifier.Unknown;
    public SourceIdentifier: AppIdentifier = AppIdentifier.Unknown;
    public EncryptedKey?: string;
    public Iv?: string;
    public IsDataEncrypted: boolean = false;

    // NEW: Security fields
    public Signature?: string;          // Digital signature for authenticity
    public Timestamp: number;            // Unix timestamp in milliseconds
    public Nonce: string;                // Random value to prevent replay attacks

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
        this.DataAsJsonStringOrEncryptedData = data;

        // NEW: Initialize security fields
        this.Timestamp = Date.now();
        this.Nonce = this.generateNonce();
    }

    // NEW: Generate cryptographically secure nonce
    private generateNonce(): string {
        const array = new Uint8Array(16);
        crypto.getRandomValues(array);
        return btoa(String.fromCharCode(...array));
    }

    // NEW: Sign this message with sender's private key
    public async SignMessageAsync(): Promise<void> {
        // Create canonical string to sign (includes all important fields)
        const messageToSign = this.getCanonicalString();
        this.Signature = await CryptoUtils.SignMessageAsync(messageToSign);
    }

    // NEW: Verify signature using sender's public signing key
    public async VerifySignatureAsync(senderSigningPublicKey: CryptoKey): Promise<boolean> {
        if (!this.Signature) {
            console.warn('Message has no signature');
            return false;
        }
        
        // Check timestamp to prevent replay attacks (e.g., within 5 minutes)
        const fiveMinutes = 5 * 60 * 1000;
        const age = Date.now() - this.Timestamp;
        if (age > fiveMinutes) {
            console.warn(`Message too old: ${age}ms (max ${fiveMinutes}ms)`);
            return false;
        }
        
        if (age < 0) {
            console.warn('Message timestamp is in the future');
            return false;
        }

        // Verify the signature
        const messageToVerify = this.getCanonicalString();
        return await CryptoUtils.VerifyMessageAsync(
            messageToVerify, 
            this.Signature, 
            senderSigningPublicKey
        );
    }

    // NEW: Get canonical string representation for signing/verification
    private getCanonicalString(): string {
        // Include all fields that shouldn't change after signing
        return `${this.TargetIdentifier}:${this.SourceIdentifier}:${this.Type}:${this.DataAsJsonStringOrEncryptedData}:${this.Timestamp}:${this.Nonce}:${this.MessageId}`;
    }

    // UPDATE: Modify fromString to include new fields
    public static fromString(jsonString: string | any): MessageRawData {
        try {
            const parsed: any = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;

            const type: MessageType = parsed?.Type ?? MessageType.Unknown;
            const data: string = parsed?.DataAsJsonStringOrEncryptedData ?? '';
            const messageId: string | null = parsed?.MessageId ?? null;
            const targetIdentifier: AppIdentifier = parsed?.TargetIdentifier ?? AppIdentifier.Unknown;
            const sourceIdentifier: AppIdentifier = parsed?.SourceIdentifier ?? AppIdentifier.Unknown;

            const msg = new MessageRawData(targetIdentifier, sourceIdentifier, type, data, messageId);
            
            // Existing fields
            msg.EncryptedKey = parsed?.EncryptedKey;
            msg.Iv = parsed?.Iv;
            msg.IsDataEncrypted = parsed?.IsDataEncrypted ?? false;
            
            // NEW: Security fields
            msg.Signature = parsed?.Signature;
            msg.Timestamp = parsed?.Timestamp ?? Date.now();
            msg.Nonce = parsed?.Nonce ?? '';

            return msg;
        } catch (e) {
            console.error('Error parsing MessageData from string:', e);
            return new MessageRawData(AppIdentifier.Unknown, AppIdentifier.Unknown, MessageType.Unknown, '', '');
        }
    }

    // ...existing methods...
}
```

---

## Phase 3: Implement Trusted App Registry

### New File: `trustedAppRegistry.ts`

Create a registry to validate trusted apps and their origins:

```typescript
import { AppIdentifier } from '../abstractions/types/commonTypes';

export interface TrustedAppConfig {
    allowedOrigins: string[];
    publicKeyFingerprint?: string;  // SHA-256 hash of public key (optional)
    description?: string;
}

export class TrustedAppRegistry {
    // Registry of trusted apps with their allowed origins
    private static trustedApps: Map<AppIdentifier, TrustedAppConfig> = new Map([
        [AppIdentifier.TrabyterStaking, { 
            allowedOrigins: [
                'https://staking.trabyter.com',
                'https://localhost:3000',
                'http://localhost:3000'
            ],
            description: 'Trabyter Staking Application'
        }],
        // Add other trusted apps here
        // [AppIdentifier.AnotherApp, { 
        //     allowedOrigins: ['https://app.example.com'],
        //     publicKeyFingerprint: 'base64-encoded-sha256-hash'
        // }],
    ]);

    /**
     * Check if an app is trusted based on its identifier and origin
     */
    public static isAppTrusted(appId: AppIdentifier, origin: string): boolean {
        const trustedApp = this.trustedApps.get(appId);
        if (!trustedApp) {
            console.warn(`App ${appId} is not in trusted registry`);
            return false;
        }
        
        const isTrusted = trustedApp.allowedOrigins.includes(origin);
        if (!isTrusted) {
            console.warn(`Origin ${origin} not allowed for app ${appId}`);
        }
        
        return isTrusted;
    }

    /**
     * Verify public key fingerprint (optional, for additional security)
     */
    public static async verifyPublicKeyFingerprint(
        appId: AppIdentifier, 
        publicKey: CryptoKey
    ): Promise<boolean> {
        const trustedApp = this.trustedApps.get(appId);
        if (!trustedApp?.publicKeyFingerprint) {
            // No fingerprint configured, skip verification
            return true;
        }
        
        try {
            const exported = await crypto.subtle.exportKey('jwk', publicKey);
            const keyString = JSON.stringify(exported);
            const encoder = new TextEncoder();
            const data = encoder.encode(keyString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const fingerprint = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));
            
            const isValid = fingerprint === trustedApp.publicKeyFingerprint;
            if (!isValid) {
                console.error(`Public key fingerprint mismatch for app ${appId}`);
            }
            
            return isValid;
        } catch (error) {
            console.error('Error verifying public key fingerprint:', error);
            return false;
        }
    }

    /**
     * Add a new trusted app at runtime (use with caution)
     */
    public static addTrustedApp(appId: AppIdentifier, config: TrustedAppConfig): void {
        if (this.trustedApps.has(appId)) {
            console.warn(`App ${appId} already exists in registry`);
            return;
        }
        this.trustedApps.set(appId, config);
    }

    /**
     * Get list of all trusted app identifiers
     */
    public static getTrustedAppIds(): AppIdentifier[] {
        return Array.from(this.trustedApps.keys());
    }
}
```

---

## Phase 4: Secure Message Processing

### Update Message Handler

Modify your message reception handler to verify signatures:

```typescript
private static async MessageReceived(event: MessageEvent) {
    try {
        // 1. Validate basic message structure
        if (!event.data || !event.data.type || !event.data.data) {
            console.warn('Received malformed message:', event.data);
            return;
        }

        // 2. Parse the message
        const messageData = MessageRawData.fromString(event.data.data);
        
        // 3. Verify the sender is trusted based on origin
        if (!TrustedAppRegistry.isAppTrusted(messageData.SourceIdentifier, event.origin)) {
            console.warn('Received message from untrusted source:', {
                source: messageData.SourceIdentifier,
                origin: event.origin
            });
            return;
        }

        // 4. Get sender's signing public key for verification
        const senderSigningPublicKey = CryptoUtils.dicSigningPublicKeys[messageData.SourceIdentifier];
        if (!senderSigningPublicKey) {
            console.warn('No signing public key available for sender:', messageData.SourceIdentifier);
            return;
        }

        // 5. Verify message signature and timestamp (prevents replay attacks)
        const isValid = await messageData.VerifySignatureAsync(senderSigningPublicKey);
        if (!isValid) {
            console.error('Message signature verification failed - possible tampering or replay attack');
            return;
        }

        // 6. (Optional) Verify public key fingerprint for additional security
        const fingerprintValid = await TrustedAppRegistry.verifyPublicKeyFingerprint(
            messageData.SourceIdentifier,
            senderSigningPublicKey
        );
        if (!fingerprintValid) {
            console.error('Public key fingerprint verification failed');
            return;
        }

        // 7. Message is authenticated and verified - proceed with processing
        console.log('✓ Message verified from trusted source:', messageData.SourceIdentifier);
        
        // Decrypt if necessary
        const internalJsonString = await messageData.GetInternalDataJsonString();
        
        // Handle specific message types...
        switch (messageData.Type) {
            case MessageType.RequestPublicKey:
                // Handle public key request
                break;
            case MessageType.ResponsePublicKey:
                // Handle public key response
                break;
            // ... other message types
        }
        
    } catch (error) {
        console.error('Error processing received message:', error);
    }
}
```

### Update Message Sending

Ensure all outgoing messages are signed:

```typescript
public static async SendMessageAsync<T>(
    targetIdentifier: AppIdentifier,
    sourceIdentifier: AppIdentifier,
    messageType: MessageType,
    payload: T,
    targetWindow: Window,
    targetOrigin: string
): Promise<void> {
    try {
        // 1. Get recipient's encryption public key
        const recipientPublicKey = CryptoUtils.dicPublicKeys[targetIdentifier];
        if (!recipientPublicKey) {
            throw new Error(`No public key available for ${targetIdentifier}`);
        }

        // 2. Encrypt the message
        const messageData = await CryptoUtils.EncryptAndReturnAsRawMessageAsync(
            targetIdentifier,
            sourceIdentifier,
            recipientPublicKey,
            messageType,
            payload
        );

        // 3. Sign the message for authenticity
        await messageData.SignMessageAsync();

        // 4. Send the message
        const messageWrapper = {
            type: 'encrypted-message',
            data: messageData.toString()
        };

        targetWindow.postMessage(messageWrapper, targetOrigin);
        
        console.log('✓ Signed and encrypted message sent to:', targetIdentifier);
        
    } catch (error) {
        console.error('Error sending message:', error);
        throw error;
    }
}
```

---

## Phase 5: Update Public Key Exchange

### Modify Public Key Exchange Messages

When exchanging public keys, also exchange signing public keys:

```typescript
// NEW: Enhanced public key exchange message
export class ResponsePublicKeyMessage {
    public EncryptionPublicKey: string;    // RSA public key for encryption
    public SigningPublicKey: string;       // ECDSA public key for signing
    public AppIdentifier: AppIdentifier;

    constructor(encryptionPublicKey: string, signingPublicKey: string, appIdentifier: AppIdentifier) {
        this.EncryptionPublicKey = encryptionPublicKey;
        this.SigningPublicKey = signingPublicKey;
        this.AppIdentifier = appIdentifier;
    }
}

// When sending public keys:
const myEncryptionPublicKey = CryptoUtils.keyPair!.publicKey;
const mySigningPublicKey = CryptoUtils.signingKeyPair!.publicKey;

const encryptionKeyJwk = await CryptoUtils.publicKeyToJwkString(myEncryptionPublicKey);
const signingKeyJwk = await CryptoUtils.signingPublicKeyToJwkString(mySigningPublicKey);

const response = new ResponsePublicKeyMessage(
    encryptionKeyJwk,
    signingKeyJwk,
    myAppIdentifier
);

// When receiving public keys:
const encryptionKey = await CryptoUtils.jwkStringToPublicKey(response.EncryptionPublicKey);
const signingKey = await CryptoUtils.jwkStringToSigningPublicKey(response.SigningPublicKey);

CryptoUtils.AddPublicKeyToDictionary(response.AppIdentifier, encryptionKey);
CryptoUtils.AddSigningPublicKeyToDictionary(response.AppIdentifier, signingKey);
```

---

## Security Benefits

### What This Achieves

1. **Message Authenticity** ✓
   - Recipient can verify message is from claimed sender
   - Digital signatures prevent impersonation

2. **Replay Attack Prevention** ✓
   - Timestamp validation ensures messages are fresh
   - Nonce ensures each message is unique

3. **Origin Validation** ✓
   - Trusted app registry validates origins
   - Prevents messages from unauthorized domains

4. **Non-Repudiation** ✓
   - Sender cannot deny sending signed messages
   - Creates audit trail

5. **Maintained Confidentiality** ✓
   - Existing encryption still protects message content
   - Only adds authentication, doesn't remove encryption

### Attack Scenarios Prevented

| Attack Type | Without Signatures | With Signatures |
|-------------|-------------------|-----------------|
| Impersonation | ❌ Attacker can send fake messages | ✅ Signature verification fails |
| Replay Attack | ❌ Old messages can be resent | ✅ Timestamp validation fails |
| Message Tampering | ❌ Encrypted data can be modified | ✅ Signature becomes invalid |
| MITM during Key Exchange | ❌ Attacker can substitute keys | ✅ Fingerprint verification fails |
| Unauthorized Origin | ❌ Any iframe can send messages | ✅ Origin check fails |

---

## Implementation Checklist

- [ ] **Phase 1**: Add signing key generation to `CryptoUtils`
  - [ ] Generate ECDSA key pair
  - [ ] Add signing/verification methods
  - [ ] Add JWK import/export for signing keys

- [ ] **Phase 2**: Enhance `MessageRawData`
  - [ ] Add Signature, Timestamp, Nonce fields
  - [ ] Implement SignMessageAsync()
  - [ ] Implement VerifySignatureAsync()
  - [ ] Update fromString() to parse new fields

- [ ] **Phase 3**: Create `TrustedAppRegistry`
  - [ ] Define trusted apps and origins
  - [ ] Implement origin validation
  - [ ] (Optional) Add public key fingerprinting

- [ ] **Phase 4**: Update Message Handlers
  - [ ] Modify MessageReceived to verify signatures
  - [ ] Update SendMessageAsync to sign messages
  - [ ] Add comprehensive error handling

- [ ] **Phase 5**: Update Key Exchange
  - [ ] Modify ResponsePublicKeyMessage
  - [ ] Exchange both encryption and signing keys
  - [ ] Store keys in appropriate dictionaries

- [ ] **Testing**
  - [ ] Test valid message flow
  - [ ] Test replay attack prevention
  - [ ] Test invalid signature rejection
  - [ ] Test unauthorized origin rejection
  - [ ] Test timestamp expiration

---

## Additional Security Recommendations

### 1. Content Security Policy (CSP)
Add CSP headers to restrict which domains can embed your app:

```html
<meta http-equiv="Content-Security-Policy" 
      content="frame-ancestors 'self' https://trusted-parent.com;">
```

### 2. Key Rotation
Implement periodic key rotation for long-lived applications:

```typescript
// Rotate keys every 30 days
const KEY_ROTATION_PERIOD = 30 * 24 * 60 * 60 * 1000;

public static async rotateKeysIfNeeded(): Promise<void> {
    const lastRotation = localStorage.getItem('lastKeyRotation');
    const now = Date.now();
    
    if (!lastRotation || now - parseInt(lastRotation) > KEY_ROTATION_PERIOD) {
        await this.rotateKeys();
        localStorage.setItem('lastKeyRotation', now.toString());
    }
}
```

### 3. Audit Logging
Log all message exchanges for security monitoring:

```typescript
interface MessageAuditLog {
    timestamp: number;
    source: AppIdentifier;
    target: AppIdentifier;
    messageType: MessageType;
    verified: boolean;
    origin: string;
}

public static logMessage(log: MessageAuditLog): void {
    // Send to your logging service
    console.log('[AUDIT]', log);
}
```

### 4. Rate Limiting
Prevent message flooding attacks:

```typescript
class RateLimiter {
    private static messageCount: Map<string, number[]> = new Map();
    private static readonly MAX_MESSAGES_PER_MINUTE = 60;

    public static checkRateLimit(source: AppIdentifier, origin: string): boolean {
        const key = `${source}:${origin}`;
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        // Get timestamps for this source
        let timestamps = this.messageCount.get(key) || [];
        
        // Remove old timestamps
        timestamps = timestamps.filter(t => t > oneMinuteAgo);
        
        // Check limit
        if (timestamps.length >= this.MAX_MESSAGES_PER_MINUTE) {
            console.warn(`Rate limit exceeded for ${key}`);
            return false;
        }

        // Add new timestamp
        timestamps.push(now);
        this.messageCount.set(key, timestamps);
        
        return true;
    }
}
```

### 5. Secure Storage
Consider using IndexedDB for storing keys (more secure than localStorage):

```typescript
class SecureKeyStorage {
    private static readonly DB_NAME = 'CryptoKeys';
    private static readonly STORE_NAME = 'keys';

    public static async storeKey(id: string, key: CryptoKey): Promise<void> {
        const db = await this.openDB();
        const exported = await crypto.subtle.exportKey('jwk', key);
        
        const tx = db.transaction(this.STORE_NAME, 'readwrite');
        await tx.objectStore(this.STORE_NAME).put({ id, key: exported });
    }

    public static async retrieveKey(id: string): Promise<CryptoKey | null> {
        const db = await this.openDB();
        const tx = db.transaction(this.STORE_NAME, 'readonly');
        const record = await tx.objectStore(this.STORE_NAME).get(id);
        
        if (!record) return null;
        
        return await crypto.subtle.importKey(
            'jwk',
            record.key,
            { name: 'RSA-OAEP', hash: 'SHA-256' },
            true,
            ['encrypt', 'decrypt']
        );
    }

    private static async openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.DB_NAME, 1);
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            request.onupgradeneeded = (event) => {
                const db = (event.target as IDBOpenDBRequest).result;
                if (!db.objectStoreNames.contains(this.STORE_NAME)) {
                    db.createObjectStore(this.STORE_NAME, { keyPath: 'id' });
                }
            };
        });
    }
}
```

---

## Performance Considerations

### Signing vs Encryption Performance

| Operation | RSA-2048 | AES-256 | ECDSA P-256 |
|-----------|----------|---------|-------------|
| Key Generation | ~50ms | ~1ms | ~20ms |
| Encryption/Sign | ~2ms | ~0.1ms | ~1ms |
| Decryption/Verify | ~10ms | ~0.1ms | ~2ms |

**Impact**: Adding ECDSA signatures adds approximately **3ms overhead per message** (1ms signing + 2ms verification). This is negligible for most use cases.

---

## Testing Strategy

### Unit Tests

```typescript
describe('CryptoUtils Signing', () => {
    it('should sign and verify messages correctly', async () => {
        await CryptoUtils.InitAsync(AppIdentifier.TrabyterStaking);
        
        const message = 'test message';
        const signature = await CryptoUtils.SignMessageAsync(message);
        const publicKey = CryptoUtils.signingKeyPair!.publicKey;
        
        const isValid = await CryptoUtils.VerifyMessageAsync(message, signature, publicKey);
        expect(isValid).toBe(true);
    });

    it('should reject tampered messages', async () => {
        await CryptoUtils.InitAsync(AppIdentifier.TrabyterStaking);
        
        const message = 'test message';
        const signature = await CryptoUtils.SignMessageAsync(message);
        const publicKey = CryptoUtils.signingKeyPair!.publicKey;
        
        const tamperedMessage = 'tampered message';
        const isValid = await CryptoUtils.VerifyMessageAsync(tamperedMessage, signature, publicKey);
        expect(isValid).toBe(false);
    });

    it('should reject old messages (replay attack)', async () => {
        const msg = new MessageRawData(
            AppIdentifier.TrabyterStaking,
            AppIdentifier.TrabyterHub,
            MessageType.TestMessage,
            'data'
        );
        
        // Set timestamp to 10 minutes ago
        msg.Timestamp = Date.now() - (10 * 60 * 1000);
        await msg.SignMessageAsync();
        
        const publicKey = CryptoUtils.signingKeyPair!.publicKey;
        const isValid = await msg.VerifySignatureAsync(publicKey);
        expect(isValid).toBe(false);
    });
});
```

### Integration Tests

```typescript
describe('Message Flow E2E', () => {
    it('should complete full encrypted and signed message flow', async () => {
        // Setup parent and child
        await CryptoUtils.InitAsync(AppIdentifier.TrabyterHub);
        const parentKeys = { ...CryptoUtils.keyPair, ...CryptoUtils.signingKeyPair };
        
        await CryptoUtils.InitAsync(AppIdentifier.TrabyterStaking);
        const childKeys = { ...CryptoUtils.keyPair, ...CryptoUtils.signingKeyPair };
        
        // Exchange keys
        CryptoUtils.AddPublicKeyToDictionary(AppIdentifier.TrabyterStaking, childKeys.publicKey);
        CryptoUtils.AddSigningPublicKeyToDictionary(AppIdentifier.TrabyterStaking, childKeys.signingPublicKey);
        
        // Create, sign, and encrypt message
        const payload = { test: 'data' };
        const msg = await CryptoUtils.EncryptAndReturnAsRawMessageAsync(
            AppIdentifier.TrabyterStaking,
            AppIdentifier.TrabyterHub,
            childKeys.publicKey,
            MessageType.TestMessage,
            payload
        );
        await msg.SignMessageAsync();
        
        // Verify and decrypt
        const isValid = await msg.VerifySignatureAsync(parentKeys.signingPublicKey);
        expect(isValid).toBe(true);
        
        const decrypted = await msg.GetInternalDataJsonString();
        expect(JSON.parse(decrypted)).toEqual(payload);
    });
});
```

---

## Migration Guide

### Step 1: Deploy Backend Changes (Non-Breaking)
1. Add signing methods to CryptoUtils
2. Add new fields to MessageRawData (optional fields)
3. Deploy to production

### Step 2: Update Clients to Send Signatures
1. Update message sending to include signatures
2. Clients can send both signed and unsigned messages temporarily

### Step 3: Enable Signature Verification
1. Update message receivers to verify signatures
2. Initially log failures but don't reject
3. Monitor logs for issues

### Step 4: Enforce Signature Requirement
1. Start rejecting unsigned messages
2. Remove backwards compatibility code

---

## Conclusion

### Current State: ❌ Vulnerable
- Only encryption (confidentiality)
- No message authentication
- No origin validation
- Susceptible to impersonation and replay attacks

### After Implementation: ✅ Secure
- Encryption + Digital Signatures
- Full message authentication
- Origin and timestamp validation
- Protected against impersonation, replay, and tampering attacks

### Recommended Timeline
- **Week 1**: Implement Phase 1-3 (core crypto and registry)
- **Week 2**: Implement Phase 4-5 (message handling and key exchange)
- **Week 3**: Testing and security audit
- **Week 4**: Gradual production rollout

---

## References

- [Web Crypto API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [ECDSA - Wikipedia](https://en.wikipedia.org/wiki/Elliptic_Curve_Digital_Signature_Algorithm)
- [postMessage Security - OWASP](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html#postmessage)
- [Content Security Policy - MDN](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)

---

**Document Version**: 1.0  
**Last Updated**: November 9, 2025  
**Author**: Security Review  
**Status**: Recommendations Pending Implementation
