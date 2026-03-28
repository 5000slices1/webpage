import { MessageCommon } from '$lib/shared/common/abstractions/messages/messageCommon';
import { AppIdentifier } from '$lib/shared/common/abstractions/types/commonTypes';

export class RequestPublicKeyMessage extends MessageCommon<RequestPublicKeyMessage> {

    constructor() {
        super();
    }
}
