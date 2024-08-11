import { IdentiyProvider } from "../IdentityConnector/identity/IdentityProvider.js";
import {createEnum} from "../utils/CommonUtils.js";
import {PageSliToken} from "../../pages/Tokens_Nft/SliToken/PageSliToken.js";

class CommonTypesModel {
   
    WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
    CommonIdentityProvider = new IdentiyProvider();    
    LogicSliToken = new PageSliToken();   

    constructor() {
        console.log("CommonTypes constructor");
    }
}

export const CommonTypes = new CommonTypesModel();

// export const WalletTypes = createEnum(['NoWallet', 'plug', 'stoic', 'dfinity']);
// export const CommonIdentityProvider = new IdentiyProvider();

// export const LogicSliToken = new PageSliToken();   