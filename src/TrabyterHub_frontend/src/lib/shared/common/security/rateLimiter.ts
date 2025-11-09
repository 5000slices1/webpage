import { AppIdentifier } from '../abstractions/types/commonTypes';

export interface RateLimitConfig
{
    maxMessagesPerMinute: number;
    maxMessagesPerSecond: number;
    blockDurationMs: number; // How long to block if limits exceeded
}

interface MessageRecord
{
    timestamps: number[];
    blockedUntil?: number;
}

/**
 * Rate limiter to prevent DoS attacks via message flooding
 * Tracks message counts per source app using sliding window algorithm
 */
export class RateLimiter
{
    private static readonly DEFAULT_CONFIG: RateLimitConfig = {
        maxMessagesPerMinute: 100,
        maxMessagesPerSecond: 10,
        blockDurationMs: 60000 // 1 minute block
    };

    private messageHistory: Map<AppIdentifier, MessageRecord> = new Map();
    private config: RateLimitConfig;
    private cleanupIntervalId?: NodeJS.Timeout;

    constructor(config?: Partial<RateLimitConfig>)
    {
        this.config = { ...RateLimiter.DEFAULT_CONFIG, ...config };

        // Start periodic cleanup of old timestamps
        this.cleanupIntervalId = setInterval(() => this.cleanup(), 60000);
    }

    /**
     * Check if a message from the given source should be allowed
     * Returns true if allowed, false if rate limit exceeded
     */
    public checkRateLimit(sourceIdentifier: AppIdentifier): boolean
    {
        const now = Date.now();
        let record = this.messageHistory.get(sourceIdentifier);

        if (!record)
        {
            record = { timestamps: [] };
            this.messageHistory.set(sourceIdentifier, record);
        }

        // Check if source is currently blocked
        if (record.blockedUntil && now < record.blockedUntil)
        {
            const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
            console.warn(`⚠️ Rate limit: ${sourceIdentifier} is blocked for ${remainingSeconds} more seconds`);
            return false;
        }

        // Remove block if expired
        if (record.blockedUntil && now >= record.blockedUntil)
        {
            delete record.blockedUntil;
            record.timestamps = []; // Clear history after unblock
        }

        // Add current timestamp
        record.timestamps.push(now);

        // Check per-second limit (last 1 second)
        const oneSecondAgo = now - 1000;
        const messagesInLastSecond = record.timestamps.filter(t => t > oneSecondAgo).length;

        if (messagesInLastSecond > this.config.maxMessagesPerSecond)
        {
            console.error(`❌ Rate limit exceeded: ${sourceIdentifier} sent ${messagesInLastSecond} messages in 1 second (max: ${this.config.maxMessagesPerSecond})`);
            this.blockSource(sourceIdentifier);
            return false;
        }

        // Check per-minute limit (last 60 seconds)
        const oneMinuteAgo = now - 60000;
        const messagesInLastMinute = record.timestamps.filter(t => t > oneMinuteAgo).length;

        if (messagesInLastMinute > this.config.maxMessagesPerMinute)
        {
            console.error(`❌ Rate limit exceeded: ${sourceIdentifier} sent ${messagesInLastMinute} messages in 1 minute (max: ${this.config.maxMessagesPerMinute})`);
            this.blockSource(sourceIdentifier);
            return false;
        }

        // Clean up old timestamps (keep only last minute)
        record.timestamps = record.timestamps.filter(t => t > oneMinuteAgo);

        return true;
    }

    /**
     * Block a source for the configured duration
     */
    private blockSource(sourceIdentifier: AppIdentifier): void
    {
        const record = this.messageHistory.get(sourceIdentifier);
        if (record)
        {
            record.blockedUntil = Date.now() + this.config.blockDurationMs;
            const blockDurationSeconds = this.config.blockDurationMs / 1000;
            console.warn(`🚫 ${sourceIdentifier} blocked for ${blockDurationSeconds} seconds due to rate limit violation`);
        }
    }

    /**
     * Get current statistics for a source
     */
    public getStatistics(sourceIdentifier: AppIdentifier): { messagesLastSecond: number; messagesLastMinute: number; isBlocked: boolean }
    {
        const record = this.messageHistory.get(sourceIdentifier);
        if (!record)
        {
            return { messagesLastSecond: 0, messagesLastMinute: 0, isBlocked: false };
        }

        const now = Date.now();
        const oneSecondAgo = now - 1000;
        const oneMinuteAgo = now - 60000;

        return {
            messagesLastSecond: record.timestamps.filter(t => t > oneSecondAgo).length,
            messagesLastMinute: record.timestamps.filter(t => t > oneMinuteAgo).length,
            isBlocked: !!record.blockedUntil && now < record.blockedUntil
        };
    }

    /**
     * Reset rate limit for a specific source (use with caution)
     */
    public resetSource(sourceIdentifier: AppIdentifier): void
    {
        this.messageHistory.delete(sourceIdentifier);
        console.log(`Rate limit reset for ${sourceIdentifier}`);
    }

    /**
     * Clean up old message records
     */
    private cleanup(): void
    {
        const now = Date.now();
        const oneMinuteAgo = now - 60000;

        for (const [identifier, record] of this.messageHistory.entries())
        {
            // Remove expired blocks
            if (record.blockedUntil && now >= record.blockedUntil)
            {
                delete record.blockedUntil;
            }

            // Clean up old timestamps
            record.timestamps = record.timestamps.filter(t => t > oneMinuteAgo);

            // Remove empty records
            if (record.timestamps.length === 0 && !record.blockedUntil)
            {
                this.messageHistory.delete(identifier);
            }
        }
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
