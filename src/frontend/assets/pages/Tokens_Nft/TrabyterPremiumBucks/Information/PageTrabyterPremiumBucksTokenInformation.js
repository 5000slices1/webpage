import { TrabyterPremiumBucks_Constants } from "../TrabyterPremiumBucksConstants.js";
import { TokenBalance } from "../../Common/TokenBalance.js";
import { CommonTypes } from "../../../../global_scripts/types/CommonTypes.js";
import { idlFactory } from "../../../../global_scripts/types/TokenInterface.js";
import { PriceFetcher,Ticker } from "../../../../global_scripts/utils/PriceFetcher.js";
import { GetCustomDictionaryFromVariant, GetValueFromDictionary } from "../../../../global_scripts/utils/CommonUtils.js";

export class PageTrabyterPremiumBucksTokenInformation{
    
    #ticker;
    #tokenMetaData;
    #totalSupply;   
    #supportedStandards;
    #burnedAmount;
    #decimals;
    #logoBase64; 
  
    
    async Init(){                        
        await this.UpdateTokenInformation();
        await this.UpdateUIFromTokenInformation();
    }    

    async UpdateUIFromTokenInformation(){

        var element = document.getElementById("TraPremiumBucks_TokenSymbol");
        if (element == null)
        {
            
            return;
        }
        if (this.#ticker != null)
        {
            document.getElementById("TraPremiumBucks_TokenSymbol").innerText = this.#ticker?.base_currency;
            document.getElementById("TraPremiumBucks_Token_Price").innerText = "1 ICP = " + this.#ticker?.last_price +" TRAPRE";
            document.getElementById("TraPremiumBucks_Canister_Id").innerText = this.#ticker?.base_id;           
        }

        document.getElementById("TraPremiumBucks_SupportedTokenTypes").innerText = this.#supportedStandards;
        document.getElementById("TraPremiumBucks_token_decimals").innerText = this.#decimals;
        document.getElementById("TraPremiumBucks_TokenSupply").innerText = this.#totalSupply;
        document.getElementById("TraPremiumBucks_BurnedAmount").innerText = this.#burnedAmount
        document.getElementById("TraPremiumBucks_TokenLogo").src = this.#logoBase64;

    }

 



    async UpdateTokenInformation(){
        
        this.#ticker = await CommonTypes.PriceFetcher.getTicker('TRAPRE', 'ICP');        

        // Get the actor
        let actor = await CommonTypes.TokenActorTraPremium.GetActor();
        let metadata = await actor.icrc1_metadata();     
        let metaDic = GetCustomDictionaryFromVariant(metadata);                 
        this.#decimals = Number(GetValueFromDictionary(metaDic, "icrc1:decimals"));
        this.#logoBase64 = GetValueFromDictionary(metaDic, "icrc1:logo");
       
        let totalSupplyRaw = BigInt(await actor.icrc1_total_supply());        
        this.#totalSupply = new TokenBalance(totalSupplyRaw, this.#decimals).GetValue();

        
        let tokenStandards = await actor.icrc1_supported_standards();
        var tokenStandardsString = "";
        for(let item of tokenStandards){
            console.log(item);
            let objectEntries = Object.entries(item);            
            let standardValue = objectEntries[1][1];
            tokenStandardsString += standardValue + " ";
        }
        this.#supportedStandards = tokenStandardsString
       
        let burnedAmountRaw = BigInt(await actor.get_burned_amount());        
        this.#burnedAmount = new TokenBalance(burnedAmountRaw, this.#decimals).GetValue();                                                           
    }
};