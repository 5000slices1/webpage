export class MessageCommon<T> {
    constructor() {}

    public toString(): string {
        return JSON.stringify(this as unknown as T);
    }

    public static fromString<T>(jsonString: string | any): T | null {
        try {
            let result: any = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
            // If the parsed result is still a JSON string (double-encoded), parse again
            if (typeof result === 'string') {
                result = JSON.parse(result);
            }
            return result as T;
        } catch (e) {
            console.error('Error parsing JSON string:', e);
            return null;
        }
    }
}
