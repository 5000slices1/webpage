/**
 * AsyncMutex - Provides mutual exclusion for async operations
 * Prevents race conditions when multiple async calls try to access shared resources
 */
export class AsyncMutex
{
    private _queue: Array<() => void> = [];
    private _locked = false;

    /**
     * Acquire the lock. If already locked, wait until released.
     */
    async acquire(): Promise<void>
    {
        return new Promise<void>((resolve) =>
        {
            if (!this._locked)
            {
                this._locked = true;
                resolve();
            } else
            {
                this._queue.push(resolve);
            }
        });
    }

    /**
     * Release the lock and allow next waiting operation to proceed
     */
    release(): void
    {
        const resolve = this._queue.shift();
        if (resolve)
        {
            resolve();
        } else
        {
            this._locked = false;
        }
    }

    /**
     * Execute a function while holding the lock
     * Automatically releases lock even if function throws
     */
    async runExclusive<T>(callback: () => Promise<T>): Promise<T>
    {
        await this.acquire();
        try
        {
            return await callback();
        } finally
        {
            this.release();
        }
    }

    /**
     * Check if mutex is currently locked
     */
    isLocked(): boolean
    {
        return this._locked;
    }
}
