import {Principal} from '@dfinity/principal';

import {ModelIdentityProvider} from '../../Abstractions/Identity/ModelIdentityProvider.js';
import {ModelWalletTypes} from '../../Abstractions/Identity/ModelWalletTypes.js';
import {PubSub} from '../utils/pubsub.js';

export class IdentityProvider {
    #_model: ModelIdentityProvider;

    constructor() {
        this.#_model = new ModelIdentityProvider();
    }

    //Connect the users wallet
    Connect() {
        this.#_model.UsersIdentity.IsConnected = true;
    }

    //Disconnect the users wallet
    Disconnect() {
        this.#_model.UsersIdentity.Reset();
    }

    GetAdapter() {
        return this.#_model.Adapter;
    }

    GetProvider() {
        return this.#_model.Adapter.provider;
    }

    IsWalletConnected() {
        if (
            this.#_model.Adapter.provider == null ||
            this.#_model.Adapter.provider == false
        ) {
            return false;
        }

        let connectedWalletInfo: any =
            this.#_model.Adapter?.connectedWalletInfo;
        if (connectedWalletInfo == null || connectedWalletInfo == undefined) {
            return false;
        }

        if (
            connectedWalletInfo.id == 'plug' &&
            this.#_model.PlugWalletConnected == false
        ) {
            return false;
        }

        return true;
    }

    async #UserIdentityChanged() {
        this.#_model.UsersIdentity.Reset();
        try {
            if (this.IsWalletConnected() == false) {
                return;
            }

            let connectedWalletInfo: any =
                this.#_model.Adapter?.connectedWalletInfo;
            if (
                connectedWalletInfo != null &&
                connectedWalletInfo != undefined
            ) {
                switch (connectedWalletInfo.id) {
                    case 'plug':
                        this.#_model.UsersIdentity.Type = ModelWalletTypes.plug;
                        break;
                    case 'stoic':
                        this.#_model.UsersIdentity.Type =
                            ModelWalletTypes.stoic;
                        break;
                    case 'dfinity':
                        this.#_model.UsersIdentity.Type =
                            ModelWalletTypes.dfinity;
                        break;
                    default:
                        return;
                }
                let principalText: string = this.#_model.Adapter
                    ?.principalId as string;
                let principal: Principal = Principal.fromText(principalText);

                this.#_model.UsersIdentity.Name = connectedWalletInfo.name;
                this.#_model.UsersIdentity.AccountPrincipalText = principalText;
                this.#_model.UsersIdentity.AccountPrincipal = principal;
                //let provider = this.#_adapter?.provider;
                this.#_model.UsersIdentity.IsConnected = true;

                console.log('UserIdentityChanged:');
                console.log(this.#_model.UsersIdentity);
            } else {
                return;
            }
        } catch (error) {
            //do nothing
        } finally {
            PubSub.publish('UserIdentityChanged', null);
        }
    }

    GetAllCanisterIds() {
        const idArray = [];
        //TODO: add canister ids
        // The current ones are just place-holders, yet to be replaced

        idArray.push('lfcgx-lyaaa-aaaag-allgq-cai');
        idArray.push('ev57g-oqaaa-aaaai-aso6a-cai');
        return idArray;
    }

    //This method is called when user identiy (inside plug wallet) is switched
    async OnPlugUserIdentitySwitched() {
        await this.Login(ModelWalletTypes.plug);
    }

    async ReInitConnectionObject() {
        var canisterIds = this.GetAllCanisterIds();
        canisterIds = Array.from(new Set([...canisterIds]));

        let connectedObj = {
            whitelist: canisterIds,
            host: 'https://icp0.io/',
        };

        this.#_model.ConnectionObject = connectedObj;

        // var canisterIds = this.WalletsProvider.GetAllCanisterIds();
        // canisterIds.push(this.SwapAppPrincipalText);
        // canisterIds = Array.from(new Set([...canisterIds]));

        // let connectedObj = {
        //     whitelist: canisterIds,
        //     host: 'https://icp0.io/'
        // };

        // this.#_connectionObject = connectedObj;
    }

    async Init() {
        await this.ReInitConnectionObject();
        //Plug wallet is sending this event when user-identity is switched
        window.addEventListener(
            'updateConnection',
            async () => {
                this.OnPlugUserIdentitySwitched();
            },
            false,
        );

        try {
            await this.Logout();
        } catch (error) {
            console.log(error);
        }
        this.#_model.Init_done = true;
    }

    async ReLogin() {
        if (this.#_model.LastLoginWalletType == ModelWalletTypes.NoWallet) {
            return;
        }

        await this.Logout(false);
        await this.Login(this.#_model.LastLoginWalletType, true);
    }

    async Login(
        walletType: ModelWalletTypes,
        sendEventUserIdentyChanged = true,
    ) {
        if (this.#_model.Inside_login == true) {
            return;
        }
        this.#_model.Inside_login = true;
        this.#_model.LastLoginWalletType = walletType;
        try {
            var walletName = '';
            switch (walletType) {
                case ModelWalletTypes.plug:
                    {
                        walletName = 'plug';
                    }
                    break;
                case ModelWalletTypes.stoic:
                    walletName = 'stoic';
                    break;
                case ModelWalletTypes.dfinity:
                    walletName = 'dfinity';
                    break;
                default:
                    walletName = '';
                    break;
            }

            if (walletName == '') {
                return;
            }

            console.log('IdentityProvider.Login walletName: ' + walletName);
            console.log('IdentityProvider.Login walletType:');
            console.log(walletType);
            console.log('ConnectionObject:');
            console.log(this.#_model.ConnectionObject);
            await this.#_model.Adapter.connect(
                walletName,
                this.#_model.ConnectionObject,
            );

            if (walletType == ModelWalletTypes.plug) {
                this.#_model.PlugWalletConnected = true;
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.#_model.Inside_login = false;

            if (sendEventUserIdentyChanged == true) {
                this.#UserIdentityChanged();
            }
        }
    }

    async Logout(sendEventUserIdentyChanged = true) {
        if (this.#_model.Inside_logout) {
            return;
        }
        this.#_model.Inside_logout = true;
        try {
            if (this.#_model.Init_done == false) {
                if (
                    this.#_model.Adapter.provider != null &&
                    this.#_model.Adapter.provider != false
                ) {
                    await this.#_model.Adapter.disconnect();
                }
                return;
            }

            if (this.IsWalletConnected() == false) {
                return;
            }

            let connectedWalletInfo: any =
                this.#_model.Adapter?.connectedWalletInfo;
            if (
                connectedWalletInfo != null &&
                connectedWalletInfo != undefined
            ) {
                if (connectedWalletInfo?.id == 'plug') {
                    this.#_model.PlugWalletConnected = false;
                }
            }

            await this.#_model.Adapter.disconnect();
        } catch (error) {
            console.log(error);
        } finally {
            this.#_model.Inside_logout = false;
            if (sendEventUserIdentyChanged == true) {
                await this.#UserIdentityChanged();
            }
        }
    }
}
