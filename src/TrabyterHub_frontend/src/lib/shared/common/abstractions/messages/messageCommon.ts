export class MessageCommon<T>
{
    public ImmediateResponseRequested: boolean = false;
    public TimeStamp: number = Date.now();

    constructor() { }

    public toString(): string
    {
        return JSON.stringify(this as unknown as T);
    }

    public static fromString<T>(jsonString: string): T | null
    {
        try
        {
            const result: T = JSON.parse(jsonString);
            return result;
        } catch (e)
        {
            console.error('Error parsing JSON string:', e);
            return null;
        }
    }
}
