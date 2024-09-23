import {TrabyterBucks_Constants} from "./../TrabyterBucksConstants.js";
import { TokenBalance } from "../../Common/TokenBalance.js";
import { CommonTypes } from "../../../../global_scripts/types/CommonTypes.js";
import { idlFactory } from "../../../../global_scripts/types/TokenInterface.js";
import { PriceFetcher } from "../../../../global_scripts/utils/PriceFetcher.js";

export class PageTrabyterBucksTokenInformation{

    #priceFetcher;

    async Init(){
        console.log("PageTrabyterBucksTokenInformation Init");
        this.#priceFetcher = new PriceFetcher();

        let result = await this.#priceFetcher.fetchTickers();
        console.log("result: ");
        console.log(result);
    }    
};