import {TrabyterPremiumBucks_Constants} from "../TrabyterPremiumBucksConstants.js";
import { TokenBalance } from "../../Common/TokenBalance.js";
import { CommonTypes } from "../../../../global_scripts/types/CommonTypes.js";
import { idlFactory } from "../../../../global_scripts/types/TokenInterface.js";
export class TrabyterBucksTokenInterface {
 
   
    async Init(){
        return;
        console.log("TrabyterPremiumBucksTokenInterface Init");

        document.getElementById("TraBucksPremium_Interface_Burn_button").onclick = async () => 
            {
                await this.Burn_Tokens()
            }; 

    }

    async #Get_Actor(){
        let adapter = CommonTypes.CommonIdentityProvider.GetAdapter(); //.burn({value: rawValue});
            let provider = adapter.provider;
            let actor = provider.createActor({ canisterId: TrabyterPremiumBucks_Constants.MainnetCanisterId, 
                interfaceFactory: idlFactory });
                return actor;
    }

    async Burn_Tokens()
    {
        return;
        console.log("Burn_Tokens");

        let amount = document.getElementById("TraBucksPremium_Interface_Burn_amount").value;
        let amountValue = Number(amount);

        // First we need to get the decimal places of the token
        let decimals = TrabyterPremiumBucks_Constants.Decimals;
        let tokenBalance = TokenBalance.FromNumber(amountValue, decimals);
        let rawValue = tokenBalance.GetRawValue();
        console.log("rawValue: " + rawValue);   
        if (CommonTypes.CommonIdentityProvider.IsWalletConnected() == false)
        {
            alert('Please connect your wallet first');
        }
        else
        {
            // let actor = CommonTypes.CommonIdentityProvider.GetActor();
            // let result = await actor.burn({value: rawValue});
            // console.log("burn result: " + result);
            

            let actor = await this.#Get_Actor();
            let response = await actor.burn({
                memo: [],
                amount: rawValue,                
                from_subaccount: [],
                created_at_time: []
            });
            console.log("burn response: " + response);
            //let actor = await provider.createActor({ canisterId: canisterId, interfaceFactory: Icrc1Interface });

        }

    }


}