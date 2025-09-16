import {BaseMessage} from '$lib/javascript/Abstractions/messages/messageData/baseMessage';

export class MessageFullScreenRequestMessage extends BaseMessage<MessageFullScreenRequestMessage> {
    UseFullScreen: boolean;

    constructor(useFullScreen: boolean) {
        super();
        this.UseFullScreen = useFullScreen;
    }
}
