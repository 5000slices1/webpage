# Quick Start Guide: Security Enhancements

## 🚀 Getting Started

### Step 1: Generate Your App's Key Fingerprints

After deploying your app for the first time, run this in the browser console:

```javascript
// For TrabyterStaking app
const encFP = await TrustedAppRegistry.generateKeyFingerprint(
    CryptoUtils.GetPublicKey(AppIdentifier.TrabyterStaking)
);
const sigFP = await TrustedAppRegistry.generateKeyFingerprint(
    CryptoUtils.GetSigningPublicKey(AppIdentifier.TrabyterStaking)
);

console.log('Add these to trustedAppRegistry.ts:');
console.log('publicKeyFingerprint:', encFP);
console.log('signingKeyFingerprint:', sigFP);
```

### Step 2: Update Trusted App Registry

Edit `src/lib/shared/common/security/trustedAppRegistry.ts`:

```typescript
[AppIdentifier.TrabyterStaking, {
    allowedOrigins: [
        'http://ucwa4-rx777-77774-qaada-cai.localhost:4943',
        'https://staking.trabyter.com'
    ],
    publicKeyFingerprint: 'sha256:YOUR_GENERATED_FINGERPRINT_HERE',
    signingKeyFingerprint: 'sha256:YOUR_GENERATED_FINGERPRINT_HERE',
    description: 'Trabyter Staking Application'
}]
```

### Step 3: Deploy & Monitor

Watch the console for security events:

✅ Success indicators:
```
✅ Public keys imported and fingerprints verified for: TrabyterStaking
✅ encryption key fingerprint verified for TrabyterStaking
✅ Message signature verified for: TrabyterStaking
```

❌ Security violations:
```
❌ SECURITY: Encryption key fingerprint verification FAILED
❌ Rate limit exceeded for TrabyterStaking - message rejected
❌ REPLAY ATTACK DETECTED: Duplicate nonce from TrabyterStaking
```

## 🔧 Configuration Options

### Adjust Rate Limits

In `commonMessageProvider.ts` constructor:

```typescript
// Stricter limits
this._rateLimiter = new RateLimiter({
    maxMessagesPerMinute: 50,
    maxMessagesPerSecond: 5,
    blockDurationMs: 120000  // 2 min block
});

// More permissive
this._rateLimiter = new RateLimiter({
    maxMessagesPerMinute: 200,
    maxMessagesPerSecond: 20,
    blockDurationMs: 30000  // 30 sec block
});
```

### Adjust Replay Windows

In `messageRawData.ts`, edit `getReplayWindowForMessageType()`:

```typescript
case MessageType.YourNewMessageType:
    return 60 * 1000;  // 1 minute window
```

## 🧪 Testing

### Test Public Key Pinning

```javascript
// Should succeed with correct fingerprints
await TrustedAppRegistry.verifyPublicKeyFingerprint(
    AppIdentifier.TrabyterStaking,
    yourPublicKey,
    'encryption'
);

// Manually test rejection
TrustedAppRegistry.updateFingerprints(
    AppIdentifier.TrabyterStaking,
    'sha256:WRONG_FINGERPRINT',
    'sha256:WRONG_FINGERPRINT'
);
// Next key exchange will fail
```

### Test Rate Limiting

```javascript
// Send burst of messages
for (let i = 0; i < 15; i++) {
    await messageProvider.PostMessage(...);  // Will block after 10
}

// Check stats
const stats = rateLimiter.getStatistics(AppIdentifier.TrabyterStaking);
console.log(stats);  // { messagesLastSecond: 15, messagesLastMinute: 15, isBlocked: true }
```

### Test Nonce Deduplication

```javascript
// Create message with specific nonce
const msg = new MessageRawData();
msg.Nonce = 'test-nonce-12345';
await msg.Init(...);

// Try to send twice
await messageProvider.PostMessage(...);  // First: succeeds
await messageProvider.PostMessage(...);  // Second: rejected as replay
```

## 🔍 Monitoring

### Check Security Statistics

```javascript
// Rate limiter stats
const stats = messageProvider._rateLimiter.getStatistics(AppIdentifier.TrabyterStaking);
console.log(`Messages: ${stats.messagesLastSecond}/sec, ${stats.messagesLastMinute}/min`);
console.log(`Blocked: ${stats.isBlocked}`);

// Nonce tracker stats
const nonceStats = messageProvider._nonceTracker.getStatistics();
console.log(`Tracking ${nonceStats.totalNonces} nonces from ${nonceStats.sourceCount} sources`);

// Per-source nonce stats
const sourceStats = messageProvider._nonceTracker.getStatistics(AppIdentifier.TrabyterStaking);
console.log(`Tracking ${sourceStats.totalNonces} nonces for TrabyterStaking`);
```

### Reset Security State (Development Only)

```javascript
// Reset rate limiter for specific source
messageProvider._rateLimiter.resetSource(AppIdentifier.TrabyterStaking);

// Clear nonce history for specific source
messageProvider._nonceTracker.clearSource(AppIdentifier.TrabyterStaking);

// DANGEROUS: Clear all nonces
messageProvider._nonceTracker.clearAll();
```

## 🚨 Troubleshooting

### Problem: Fingerprint verification always warns

**Cause**: No fingerprints configured (dev mode)

**Solution**: Generate and configure fingerprints (see Step 1-2 above)

### Problem: Legitimate messages being rate limited

**Cause**: Limits too strict for usage pattern

**Solution**: Increase `maxMessagesPerMinute` or `maxMessagesPerSecond`

### Problem: Messages rejected with "Message too old"

**Cause**: System clocks out of sync or replay window too short

**Solution**: 
1. Check system time synchronization
2. Increase replay window for that message type

### Problem: "Duplicate nonce" but not a replay attack

**Cause**: Nonce generation not cryptographically random

**Solution**: Verify `generateNonce()` uses `crypto.getRandomValues()`

## 📊 Security Event Codes

| Emoji | Meaning | Action Required |
|-------|---------|-----------------|
| ✅ | Success | None - system working correctly |
| ⚠️ | Warning | Review but not critical (e.g., dev mode) |
| ❌ | Violation | Investigate immediately - possible attack |
| 🚫 | Blocked | Source temporarily blocked due to violations |
| 🧹 | Cleanup | Maintenance operation (informational) |

## 🔐 Production Checklist

Before deploying to production:

- [ ] Generate key fingerprints for all apps
- [ ] Configure fingerprints in `trustedAppRegistry.ts`
- [ ] Test fingerprint verification (should pass, not warn)
- [ ] Set appropriate rate limits for expected traffic
- [ ] Test rate limiting with realistic load
- [ ] Verify replay windows appropriate for message types
- [ ] Test nonce deduplication (send duplicate - should reject)
- [ ] Review console logs - no ⚠️ warnings in prod
- [ ] Set up monitoring for ❌ security violations
- [ ] Document incident response for detected attacks

## 📞 Support

For questions or issues with security enhancements:
1. Check console logs for detailed error messages
2. Review SECURITY_ENHANCEMENTS_IMPLEMENTATION.md
3. Review SECURITY_AUDIT.md for background context
