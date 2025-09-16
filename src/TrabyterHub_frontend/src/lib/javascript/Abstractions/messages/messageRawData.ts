export class MessageRawData {
    Id: string;
    Type: string;
    Data: string;
    Sender: string = 'TrabyterStaking';

    constructor(type: string, data: string, id: string | null = null) {
        if (id !== null) {
            const uniqueIdentifier = crypto.randomUUID();
            this.Id = uniqueIdentifier;
        } else {
            this.Id = id ? id : '';
        }

        this.Type = type;
        this.Data = data;
    }

    public toString(): string {
        return JSON.stringify(this);
    }

    public static fromString(jsonString: string): MessageRawData {
        try {
            const result: MessageRawData = JSON.parse(jsonString);
            //const messageData = new MessageData(parsed.Type, parsed.Data);
            //messageData.Id = parsed.id;
            return result;
        } catch (e) {
            console.error('Error parsing MessageData from string:', e);
            return new MessageRawData('Unknown', '', '');
        }
    }
}
