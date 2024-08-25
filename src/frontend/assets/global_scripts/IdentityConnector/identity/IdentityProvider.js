import { UsersIdentity } from "./UsersIdentity.js";
import { Artemis } from 'artemis-web3-adapter';
// import { Artemis } from  "../../../../../node_modules/artemis-web3-adapter/src/index.js";
import { PubSub } from "../../utils/PubSub.js";
//import { WalletTypes } from "../../types/CommonTypes.js";
import { CommonTypes } from "../../types/CommonTypes.js";
import { Principal } from "@dfinity/principal";
// import { Principal } from "../../../../../node_modules/@dfinity/principal/lib/cjs/index.js";
import {TrabyterBucks_Constants} from "../../../pages/Tokens_Nft/TrabyterBucks/TrabyterBucksConstants.js";
export class IdentiyProvider {

    //private fields    
    #_adapter;
    #_plugWalletConnected;
    #_init_done;
    #_inside_login;
    #_inside_logout;
    #_lastLoginWalletType;
    #_connectionObject;

    //public fields
    UsersIdentity = new UsersIdentity();
    
    constructor() {

        // this.#_adapter = new Artemis();
        // window.artemis = this.#_adapter;

        //window.artemis =  new Artemis();
        //this.#_adapter = window.artemis; 

        // if (window.artemis != null)
        // {
        //     console.log("not null");
        //     //this.#_adapter = window.artemis;  
        //     //this.#_adapter = new Artemis();
        //     window.artemis =  new Artemis();
        //     this.#_adapter = window.artemis; 
        // }
        // else{
        //     console.log("null");
        //     this.#_adapter = new Artemis();
        //     window.artemis = this.#_adapter;
        // }


        
        this.#_adapter = new Artemis();    
        this.#_init_done = false;
        
    }

    GetAdapter(){
        return this.#_adapter;
    }
    
    IsWalletConnected() {

        if (this.#_adapter.provider == null || this.#_adapter.provider == false) {
            return false;
        }

        let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;
        if (connectedWalletInfo == null || connectedWalletInfo == false) {
            return false;
        }

        if (connectedWalletInfo.id == 'plug' && this.#_plugWalletConnected == false) {
            return false;
        }

        return true;
    }
    
    async #UserIdentityChanged() {
        
        this.UsersIdentity.Reset();
        try {
            if (this.IsWalletConnected() == false) {
                return;
            }

            let connectedWalletInfo = this.#_adapter?.connectedWalletInfo;
            if (connectedWalletInfo != null && connectedWalletInfo != false) {

                switch (connectedWalletInfo.id) {
                    case 'plug': this.UsersIdentity.Type = CommonTypes.WalletTypes.plug;
                        break;
                    case 'stoic': this.UsersIdentity.Type = CommonTypes.WalletTypes.stoic;
                        break;
                    case 'dfinity': this.UsersIdentity.Type = CommonTypes.WalletTypes.dfinity;
                        break;
                    default: return;
                }
                let principalText = this.#_adapter?.principalId;
                let principal = Principal.fromText(principalText);


                this.UsersIdentity.Name = connectedWalletInfo.name;
                this.UsersIdentity.AccountPrincipalText = principalText;
                this.UsersIdentity.AccountPrincipal = principal;
                //let provider = this.#_adapter?.provider;                
                this.UsersIdentity.IsConnected = true;

            } else {
                return;
            }
        } catch (error) {
            //do nothing
        }
        finally {

            PubSub.publish('UserIdentityChanged', null);            
        }
    }

    GetAllCanisterIds() {
        const idArray = [];        
        idArray.push(TrabyterBucks_Constants.MainnetCanisterId);         
        return idArray;
      }

    //This method is called when user identiy (inside plug wallet) is switched 
    async OnPlugUserIdentitySwitched() {
        await this.Login(CommonTypes.WalletTypes.plug);
    }

    async ReInitConnectionObject() {

        var canisterIds = this.GetAllCanisterIds();        
        canisterIds = Array.from(new Set([...canisterIds]));

        let connectedObj = {
            whitelist: canisterIds,
            host: 'https://icp0.io/'
        };

        this.#_connectionObject = connectedObj;

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
        window.addEventListener("updateConnection", async () => { this.OnPlugUserIdentitySwitched(); }, false);

        try {
            await this.Logout();
        }
        catch (error) {
            console.log(error);
        }
        this.#_init_done = true;

    }

    async ReLogin() {
        if (!this.#_lastLoginWalletType) {
            return;
        }
        await this.Logout(false);
        await this.Login(this.#_lastLoginWalletType, true);
    }

    async Login(walletType, sendEventUserIdentyChanged = true) {

        if (this.#_inside_login == true) {
            return;
        }
        this.#_inside_login = true;
        this.#_lastLoginWalletType = walletType;
        try {
            var walletName = "";
            switch (walletType) {
                case CommonTypes.WalletTypes.plug: {
                    walletName = "plug";
                }
                    break;
                case CommonTypes.WalletTypes.stoic: walletName = "stoic";
                    break;
                case CommonTypes.WalletTypes.dfinity: walletName = "dfinity";
                    break;
                default: walletName = "";
                    break;
            }

            if (walletName == "") {
                return;
            }

            let result = await this.#_adapter.connect(walletName, this.#_connectionObject);

            if (walletType == CommonTypes.WalletTypes.plug) {
                this.#_plugWalletConnected = true;
            }
            

        }
        catch (error) {
            console.log(error);
        }
        finally {
            this.#_inside_login = false;

            if (sendEventUserIdentyChanged == true) {
                this.#UserIdentityChanged();
            }
        }
    }

    async Logout(sendEventUserIdentyChanged = true) {

        if (this.#_inside_logout) {
            return;
        }
        this.#_inside_logout = true;
        try {

            if (this.#_init_done == false) {
                if (this.#_adapter.provider != null && this.#_adapter.provider != false) {
                    await this.#_adapter.disconnect();
                };
                return;
            }

            if (this.IsWalletConnected() == false) {
                return;
            }

            if (this.#_adapter?.connectedWalletInfo?.id == 'plug') {
                this.#_plugWalletConnected = false;
            }

            await this.#_adapter.disconnect();
        }
        catch (error) {
            console.log(error);
        }
        finally {
            this.#_inside_logout = false;
            if (sendEventUserIdentyChanged == true) {
                await this.#UserIdentityChanged();
            }
        }
    }
}










