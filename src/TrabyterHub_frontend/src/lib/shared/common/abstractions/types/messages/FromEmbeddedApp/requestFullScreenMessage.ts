import {MessageCommon} from '$lib/shared/common/abstractions/types/messages/messageCommon';

export class RequestFullScreenMessage extends MessageCommon<RequestFullScreenMessage> {
    UseFullScreen: boolean;

    constructor(useFullScreen: boolean) {
        super();
        this.UseFullScreen = useFullScreen;
    }
}
