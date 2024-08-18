import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageTrabyterBucks} from "../../pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.js";

class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider = new IdentiyProvider();    
    LogicTrabyterBucksToken = new PageTrabyterBucks();   

    constructor() {
        console.log("CommonTypes constructor");
    }
}

export const CommonTypes = new CommonTypesModel();

// export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
// export const CommonIdentityProvider = new IdentiyProvider();

// export const LogicSliToken = new PageSliToken();   