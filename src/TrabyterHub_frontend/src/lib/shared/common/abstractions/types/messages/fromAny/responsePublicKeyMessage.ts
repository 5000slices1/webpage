import {AppIdentifier} from '$lib/shared/common/abstractions/types/commonTypes';
import {MessageCommon} from '$lib/shared/common/abstractions/types/messages/messageCommon';

export class ResponsePublicKeyMessage extends MessageCommon<ResponsePublicKeyMessage> {
    public readonly senderSource: AppIdentifier;
    public readonly publicKey: string;

    constructor(senderSource: AppIdentifier, publicKey: string = '') {
        super();
        this.senderSource = senderSource;
        this.publicKey = publicKey;
    }
}
