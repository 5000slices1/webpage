//import {Artemis} from '../../../thirdParty/artemis-web3-adapter/src/index.js';
import {Artemis} from '../../../../artemis-web3-adapter/src/index.js';
import {ModelUsersIdentity} from './ModelUsersIdentity';
import {ModelWalletTypes} from './ModelWalletTypes';

export class ModelIdentityProvider {
    Init_done: boolean = false;
    PlugWalletConnected: boolean = false;
    Adapter: any;
    ConnectionObject: {whitelist: string[]; host: string} | undefined;
    LastLoginWalletType: ModelWalletTypes = ModelWalletTypes.NoWallet;
    Inside_login: boolean = false;
    Inside_logout: boolean = false;

    //The users identity
    UsersIdentity: ModelUsersIdentity;

    constructor() {
        this.UsersIdentity = new ModelUsersIdentity();
        this.Adapter = new Artemis();
        this.Init_done = false;
        this.PlugWalletConnected = false;
        this.LastLoginWalletType = ModelWalletTypes.NoWallet;
        this.Inside_login = false;
        this.Inside_logout = false;
    }
}
