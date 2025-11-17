import { MessageCommon } from '$lib/shared/common/abstractions/messages/messageCommon';

export class ResponseWalletStatusMessage extends MessageCommon<ResponseWalletStatusMessage>
{

    public IsConnected: boolean;
    public WalletName: string;
    public PrincipalText: string;
    public AccountId: string;

    constructor()
    {
        super();
        this.IsConnected = false;
        this.WalletName = '';
        this.PrincipalText = '';
        this.AccountId = '';
    }
}
