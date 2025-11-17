import { Principal } from '@dfinity/principal';

import { ModelIdentityProvider } from '../../Abstractions/Identity/ModelIdentityProvider.js';
import { ModelUsersIdentity } from '../../Abstractions/Identity/ModelUsersIdentity';
import { ModelWalletTypes } from '../../Abstractions/Identity/ModelWalletTypes.js';
import { AsyncMutex } from '../../Utils/AsyncMutex';
import { MainClass } from '../MainClass.js';
import { PubSub } from '../utils/pubsub.js';

import type { MessageProvider } from '../messages/messageProvider.js';

export class IdentityProvider
{
    #_model: ModelIdentityProvider;
    #_loginMutex: AsyncMutex;
    #_logoutMutex: AsyncMutex;
    #_identityChangeMutex: AsyncMutex;

    constructor()
    {
        this.#_model = new ModelIdentityProvider();
        this.#_loginMutex = new AsyncMutex();
        this.#_logoutMutex = new AsyncMutex();
        this.#_identityChangeMutex = new AsyncMutex();
    }

    //Connect the users wallet
    Connect()
    {
        this.#_model.UsersIdentity.IsConnected = true;
    }

    //Disconnect the users wallet
    Disconnect()
    {
        this.#_model.UsersIdentity.Reset();
    }

    GetAdapter()
    {
        return this.#_model.Adapter;
    }

    GetProvider()
    {
        return this.#_model.Adapter.provider;
    }

    IsWalletConnected()
    {
        if (
            this.#_model.Adapter.provider == null ||
            this.#_model.Adapter.provider == false
        )
        {
            return false;
        }

        let connectedWalletInfo: any =
            this.#_model.Adapter?.connectedWalletInfo;
        if (connectedWalletInfo == null || connectedWalletInfo == undefined)
        {
            return false;
        }

        if (
            connectedWalletInfo.id == 'plug' &&
            this.#_model.PlugWalletConnected == false
        )
        {
            return false;
        }

        return true;
    }

    public GetModelUsersIdenity(): ModelUsersIdentity
    {
        // Return a deep clone to prevent external modifications to internal state
        const clone = new ModelUsersIdentity();
        clone.IsConnected = this.#_model.UsersIdentity.IsConnected;
        clone.Type = this.#_model.UsersIdentity.Type;
        clone.Name = this.#_model.UsersIdentity.Name;
        clone.AccountPrincipalText = this.#_model.UsersIdentity.AccountPrincipalText;
        // Principal objects are immutable, but we create a new instance from text for safety
        clone.AccountPrincipal = Principal.fromText(
            this.#_model.UsersIdentity.AccountPrincipalText || Principal.anonymous().toText()
        );
        return clone;
    }

    async #UserIdentityChanged()
    {
        // Use mutex to prevent concurrent modifications to UsersIdentity
        await this.#_identityChangeMutex.runExclusive(async () =>
        {
            this.#_model.UsersIdentity.Reset();
            try
            {
                if (this.IsWalletConnected() == false)
                {
                    return;
                }

                let connectedWalletInfo: any =
                    this.#_model.Adapter?.connectedWalletInfo;
                if (
                    connectedWalletInfo != null &&
                    connectedWalletInfo != undefined
                )
                {
                    switch (connectedWalletInfo.id)
                    {
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
                } else
                {
                    return;
                }
            } catch (error)
            {
                //do nothing
            } finally
            {
                PubSub.publish('UserIdentityChanged', null);

                // Send updated identity to all connected apps
                try
                {
                    console.log('*************** Sending user identity to all connected apps...');
                    let messageProvider: MessageProvider | undefined;
                    MainClass.subscribe((mc) =>
                    {
                        messageProvider = mc.MessageProvider;
                    })();

                    if (messageProvider && typeof messageProvider.SendUsersIdentityAsyncToAllConnectedAppsAsync === 'function')
                    {
                        await messageProvider.SendUsersIdentityAsyncToAllConnectedAppsAsync();
                    }
                } catch (error)
                {
                    console.error('Failed to send users identity to connected apps:', error);
                }
            }
        });
    }

    GetAllCanisterIds()
    {
        const idArray = [];
        //TODO: add canister ids
        // The current ones are just place-holders, yet to be replaced

        idArray.push('ryjl3-tyaaa-aaaaa-aaaba-cai');
        //idArray.push('ev57g-oqaaa-aaaai-aso6a-cai');
        return idArray;
    }

    //This method is called when user identiy (inside plug wallet) is switched
    async OnPlugUserIdentitySwitched()
    {
        await this.Login(ModelWalletTypes.plug);
    }

    async ReInitConnectionObject()
    {
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

    async Init()
    {
        await this.ReInitConnectionObject();
        //Plug wallet is sending this event when user-identity is switched
        window.addEventListener(
            'updateConnection',
            async () =>
            {
                this.OnPlugUserIdentitySwitched();
            },
            false,
        );

        try
        {
            await this.Logout();
        } catch (error)
        {
            console.log(error);
        }
        this.#_model.Init_done = true;
    }

    async ReLogin()
    {
        if (this.#_model.LastLoginWalletType == ModelWalletTypes.NoWallet)
        {
            return;
        }

        await this.Logout(false);
        await this.Login(this.#_model.LastLoginWalletType, true);
    }

    async Login(
        walletType: ModelWalletTypes,
        sendEventUserIdentyChanged = true,
    )
    {
        // Use mutex to prevent concurrent login attempts
        await this.#_loginMutex.runExclusive(async () =>
        {
            if (this.#_model.Inside_login == true)
            {
                return;
            }
            this.#_model.Inside_login = true;
            this.#_model.LastLoginWalletType = walletType;
            try
            {
                var walletName = '';
                switch (walletType)
                {
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

                if (walletName == '')
                {
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

                if (walletType == ModelWalletTypes.plug)
                {
                    this.#_model.PlugWalletConnected = true;
                }
            } catch (error)
            {
                console.log(error);
            } finally
            {
                this.#_model.Inside_login = false;

                if (sendEventUserIdentyChanged == true)
                {
                    this.#UserIdentityChanged();
                }
            }
        });
    }

    async Logout(sendEventUserIdentyChanged = true)
    {
        // Use mutex to prevent concurrent logout attempts
        await this.#_logoutMutex.runExclusive(async () =>
        {
            if (this.#_model.Inside_logout)
            {
                return;
            }
            this.#_model.Inside_logout = true;
            try
            {
                if (this.#_model.Init_done == false)
                {
                    if (
                        this.#_model.Adapter.provider != null &&
                        this.#_model.Adapter.provider != false
                    )
                    {
                        await this.#_model.Adapter.disconnect();
                    }
                    return;
                }

                if (this.IsWalletConnected() == false)
                {
                    return;
                }

                let connectedWalletInfo: any =
                    this.#_model.Adapter?.connectedWalletInfo;
                if (
                    connectedWalletInfo != null &&
                    connectedWalletInfo != undefined
                )
                {
                    if (connectedWalletInfo?.id == 'plug')
                    {
                        this.#_model.PlugWalletConnected = false;
                    }
                }

                await this.#_model.Adapter.disconnect();
            } catch (error)
            {
                console.log(error);
            } finally
            {
                this.#_model.Inside_logout = false;
                if (sendEventUserIdentyChanged == true)
                {
                    await this.#UserIdentityChanged();
                }
            }
        });
    }
}
