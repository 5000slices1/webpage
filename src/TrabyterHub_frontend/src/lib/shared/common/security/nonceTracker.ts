import { AppIdentifier } from '../abstractions/types/commonTypes';

/**
 * Tracks used nonces to prevent replay attacks within the timestamp window
 * Even if a message is within the valid timestamp window, the nonce must be unique
 */
export class NonceTracker
{
    // Map of source identifier -> Map of nonce -> timestamp when it was recorded
    private usedNonces: Map<AppIdentifier, Map<string, number>> = new Map();
    private cleanupIntervalId?: NodeJS.Timeout;
    private readonly NONCE_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes (longer than max replay window)

    constructor()
    {
        // Periodically clean up old nonces
        this.cleanupIntervalId = setInterval(() => this.cleanup(), 60000); // Every minute
    }

    /**
     * Check if a nonce has been seen before for this source
     * Returns true if nonce is fresh (not seen), false if it's a duplicate
     */
    public checkAndRecordNonce(sourceIdentifier: AppIdentifier, nonce: string): boolean
    {
        const now = Date.now();

        // Get or create nonce map for this source
        let sourceNonces = this.usedNonces.get(sourceIdentifier);
        if (!sourceNonces)
        {
            sourceNonces = new Map();
            this.usedNonces.set(sourceIdentifier, sourceNonces);
        }

        // Check if nonce was already used
        if (sourceNonces.has(nonce))
        {
            const originalTimestamp = sourceNonces.get(nonce)!;
            const age = now - originalTimestamp;
            console.error(`❌ REPLAY ATTACK DETECTED: Duplicate nonce from ${sourceIdentifier}`);
            console.error(`Nonce: ${nonce.substring(0, 16)}...`);
            console.error(`Original message was ${age}ms ago`);
            return false;
        }

        // Record this nonce as used
        sourceNonces.set(nonce, now);
        return true;
    }

    /**
     * Check if a nonce has been seen (without recording it)
     * Useful for testing purposes
     */
    public hasSeenNonce(sourceIdentifier: AppIdentifier, nonce: string): boolean
    {
        const sourceNonces = this.usedNonces.get(sourceIdentifier);
        return sourceNonces ? sourceNonces.has(nonce) : false;
    }

    /**
     * Get statistics about tracked nonces
     */
    public getStatistics(sourceIdentifier?: AppIdentifier): { totalNonces: number; sourceCount: number }
    {
        if (sourceIdentifier)
        {
            const sourceNonces = this.usedNonces.get(sourceIdentifier);
            return {
                totalNonces: sourceNonces ? sourceNonces.size : 0,
                sourceCount: 1
            };
        }

        let totalNonces = 0;
        for (const sourceNonces of this.usedNonces.values())
        {
            totalNonces += sourceNonces.size;
        }

        return {
            totalNonces,
            sourceCount: this.usedNonces.size
        };
    }

    /**
     * Clean up expired nonces (older than NONCE_EXPIRY_MS)
     */
    private cleanup(): void
    {
        const now = Date.now();
        let removedCount = 0;

        for (const [sourceId, sourceNonces] of this.usedNonces.entries())
        {
            const beforeSize = sourceNonces.size;

            // Remove expired nonces
            for (const [nonce, timestamp] of sourceNonces.entries())
            {
                if (now - timestamp > this.NONCE_EXPIRY_MS)
                {
                    sourceNonces.delete(nonce);
                }
            }

            removedCount += beforeSize - sourceNonces.size;

            // Remove empty source maps
            if (sourceNonces.size === 0)
            {
                this.usedNonces.delete(sourceId);
            }
        }

        if (removedCount > 0)
        {
            console.log(`🧹 NonceTracker: Cleaned up ${removedCount} expired nonces`);
        }
    }

    /**
     * Manually clear nonces for a specific source (use with caution)
     */
    public clearSource(sourceIdentifier: AppIdentifier): void
    {
        this.usedNonces.delete(sourceIdentifier);
        console.log(`Cleared nonce history for ${sourceIdentifier}`);
    }

    /**
     * Clear all tracked nonces (use with extreme caution)
     */
    public clearAll(): void
    {
        this.usedNonces.clear();
        console.warn('⚠️ Cleared ALL nonce history - replay protection temporarily reduced');
    }

    /**
     * Stop the cleanup timer (call when shutting down)
     */
    public destroy(): void
    {
        if (this.cleanupIntervalId)
        {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = undefined;
        }
    }
}
