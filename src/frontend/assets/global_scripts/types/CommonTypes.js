import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageTrabyterBucks} from "../../pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.js";
import {TrabyterBucksTokenInterface} from "../../pages/Tokens_Nft/TrabyterBucks/Interface/PageTrabyterBucksTokenInterface.js";
import { Actor, HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { Artemis } from 'artemis-web3-adapter';
import { PageTrabyterPremiumBucks } from "../../pages/Tokens_Nft/TrabyterPremiumBucks/PageTrabyterPremiumBucksToken.js";
import { PriceFetcher } from "../utils/PriceFetcher.js";
import { PageTrabyterBucksTokenInformation } from "../../pages/Tokens_Nft/TrabyterBucks/Information/PageTrabyterBucksTokenInformation.js";
import { PageTrabyterPremiumBucksTokenInformation } from "../../pages/Tokens_Nft/TrabyterPremiumBucks/Information/PageTrabyterPremiumBucksTokenInformation.js";
import { TokenActor } from "../utils/TokenActor.js";
import { TrabyterBucks_Constants } from "../../pages/Tokens_Nft/TrabyterBucks/TrabyterBucksConstants.js";
import { TrabyterPremiumBucks_Constants } from "../../pages/Tokens_Nft/TrabyterPremiumBucks/TrabyterPremiumBucksConstants.js";

class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider;
    LogicTrabyterBucksToken;
    LogicTrabyterBucksTokenInterface;  
    LogicTrabyterBucksTokenInformation;

    LogicTrabyterPremiumBucksToken;    
    LogicTrabyterPremiumBucksTokenInterface;      
    //LogicTrabyterPremiumBucksPriceFetcher;
    LogicTrabyterPremiumBucksTokenInformation;

    PriceFetcher;
    TokenActorTra;
    TokenActorTraPremium;

    Artemis = Artemis;
    Actor = Actor;
    HttpAgent = HttpAgent;  
    Principal = Principal;  
    InDesigner = false;   
    constructor() {
        
    }

    async Init()
    {

        this.CommonIdentityProvider = new IdentiyProvider();    

        this.TokenActorTra = new TokenActor();
        await this.TokenActorTra.Init( TrabyterBucks_Constants.LocalCanisterId,
            TrabyterBucks_Constants.MainnetCanisterId);

        this.TokenActorTraPremium = new TokenActor();
        await this.TokenActorTraPremium.Init( TrabyterPremiumBucks_Constants.LocalCanisterId,
             TrabyterPremiumBucks_Constants.MainnetCanisterId);
        
        this.PriceFetcher = new PriceFetcher();
        //await this.PriceFetcher.Init();
        this.PriceFetcher.Init();


        this.LogicTrabyterBucksToken = new PageTrabyterBucks();  
        this.LogicTrabyterBucksTokenInterface = new TrabyterBucksTokenInterface();
        this.LogicTrabyterBucksTokenInformation = new PageTrabyterBucksTokenInformation();
        //await this.LogicTrabyterBucksTokenInformation.Init();
        this.LogicTrabyterBucksTokenInformation.Init();

        this.LogicTrabyterPremiumBucksToken = new PageTrabyterPremiumBucks();
        this.LogicTrabyterPremiumBucksTokenInterface = new TrabyterBucksTokenInterface();
        this.LogicTrabyterPremiumBucksTokenInformation = new PageTrabyterPremiumBucksTokenInformation();
        this.LogicTrabyterPremiumBucksTokenInformation.Init();
                               
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