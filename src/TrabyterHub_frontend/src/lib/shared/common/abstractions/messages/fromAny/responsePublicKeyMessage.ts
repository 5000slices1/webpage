import { MessageCommon } from '$lib/shared/common/abstractions/messages/messageCommon';
import { AppIdentifier } from '$lib/shared/common/abstractions/types/commonTypes';

export class ResponsePublicKeyMessage extends MessageCommon<ResponsePublicKeyMessage>
{
    public readonly senderTarget: AppIdentifier;
    public readonly senderSource: AppIdentifier;
    public readonly publicKey: string;

    constructor(senderTarget: AppIdentifier, senderSource: AppIdentifier, publicKey: string)
    {
        super();
        this.senderTarget = senderTarget;
        this.senderSource = senderSource;
        this.publicKey = publicKey;
    }
}
