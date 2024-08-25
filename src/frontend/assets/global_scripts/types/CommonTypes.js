import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageTrabyterBucks} from "../../pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.js";
import {TrabyterBucksTokenInterface} from "../../pages/Tokens_Nft/TrabyterBucks/Interface/PageTrabyterBucksTokenInterface.js";

class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider = new IdentiyProvider();    
    LogicTrabyterBucksToken = new PageTrabyterBucks();  
    LogicTrabyterBucksTokenInterface = new TrabyterBucksTokenInterface();


    constructor() {
        console.log("CommonTypes constructor");
    }
}

export const CommonTypes = new CommonTypesModel();

// export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
// export const CommonIdentityProvider = new IdentiyProvider();

// export const LogicSliToken = new PageSliToken();   