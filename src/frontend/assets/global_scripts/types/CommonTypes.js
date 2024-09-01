import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageTrabyterBucks} from "../../pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.js";
import {TrabyterBucksTokenInterface} from "../../pages/Tokens_Nft/TrabyterBucks/Interface/PageTrabyterBucksTokenInterface.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Artemis } from 'artemis-web3-adapter';




class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider;
    LogicTrabyterBucksToken;
    LogicTrabyterBucksTokenInterface;
    Artemis = Artemis;
    Actor = Actor;
    HttpAgent = HttpAgent;  
    Principal = Principal;  
    InDesigner = false;   
    constructor() {
        
    }

    Init()
    {
        this.CommonIdentityProvider = new IdentiyProvider();    
        this.LogicTrabyterBucksToken = new PageTrabyterBucks();  
        this.LogicTrabyterBucksTokenInterface = new TrabyterBucksTokenInterface();
    }
}

class ThirdPartyTypesModel {
    
    // Artemis = Artemis;
    // Actor = Actor;
    // HttpAgent = HttpAgent;  
    // Principal = Principal;  
    constructor() {        
    }
}
//export const ThirdPartyTypes = new ThirdPartyTypesModel();

export const CommonTypes = new CommonTypesModel();



// export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
// export const CommonIdentityProvider = new IdentiyProvider();

// export const LogicSliToken = new PageSliToken();   