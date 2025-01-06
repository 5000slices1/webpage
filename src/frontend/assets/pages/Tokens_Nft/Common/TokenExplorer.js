import { idlFactory } from "../../../global_scripts/types/TokenInterface.js";
import { TokenExplorerItemModel } from "./TokenExplorerItemModel.js";
import { TokenBalance } from "./TokenBalance.js";
import { CommonTypes } from "../../../global_scripts/types/CommonTypes.js";


export class TokenExplorer{

    #frontendId = "";
    #actor = null;
    #localCanisterId = null;
    #mainNetCanisterId = null;
    #decimals = 8;

    constructor() {
        // Add constructor logic here
    }

    async Init(frontendId, localCanisterId, maintnetCanisterId) {
        this.#frontendId = frontendId;
        this.#localCanisterId = localCanisterId;
        this.#mainNetCanisterId = maintnetCanisterId;
    }

    #getActor = () => {

        if (this.#actor != null){
            return this.#actor;
        }

        let isDevelopment = process.env.NODE_ENV == "development";

        console.log("process.env.NODE_ENV: " + process.env.NODE_ENV);

        if (isDevelopment){            
            let host = "http://127.0.0.1:4943";
            let agent = new CommonTypes.HttpAgent({ host });
            agent.fetchRootKey().catch(err=>{
                console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
                console.error(err);
              });
            let actor = CommonTypes.Actor.createActor(
                idlFactory,
                {
                    canisterId: this.#localCanisterId,
                    agent: agent,           
                }
              );
              this.#actor = actor;              
        } else {
            
            let host = "https://ic0.app";
            let agent = new CommonTypes.HttpAgent({ host });           
            let actor = CommonTypes.Actor.createActor(
                idlFactory,
                {
                    canisterId: this.#mainNetCanisterId,
                    agent: agent,              
                }
              );
              this.#actor = actor;              
        }
        return this.#actor 
    };

    #TimeTicksNanoseconds_To_DateTimeString(ticksNanoSeconds) {
        
        
        let timeTicksNanoSeconds = Number(ticksNanoSeconds);
        let timeTicksMilliSeconds = Math.trunc(Number(timeTicksNanoSeconds / 1000000));
        let date = new Date(Number(timeTicksMilliSeconds));
        return date.toLocaleString();              
    };

    #Update_ModelItem_common_values(model, transaction) {

        let rawAmount = transaction?.amount;
        let rawTo = transaction?.to?.owner;
        let rawFrom = transaction?.from?.owner;

        if (rawAmount != null){
            model.Amount = new TokenBalance( BigInt(rawAmount), Number(this.#decimals))?.GetValue();
        } else{
            model.Amount = 0;
        }

        if (rawTo != null){
            model.To = CommonTypes.Principal.fromHex(rawTo?.toHex())?.toText();
        } else{
            model.To = "";
        }

        if (rawFrom != null){
            model.From = CommonTypes.Principal.fromHex(rawFrom?.toHex())?.toText();
        } else{
            model.From = "";
        }
    };


    
    async Get_Transactions(start, length) {
        // console.log("Get_Transactions");
        // console.log("start: " + start); 
        // console.log("length: " + length);

        let transactionsResponse = await this.#Get_transactionsByIndex_internal(start, length);           
        const transactions = await this.#ConvertTransactionResponseIntoOwnArray(transactionsResponse);

        return transactions;
    };

    async #ConvertTransactionResponseIntoOwnArray(transactionsResponse) {
        const transactions = new Array(transactionsResponse.length);

        //Now we need to convert
        for (let i = 0; i < transactionsResponse.length; i++) {
            let transaction = transactionsResponse[i];
            let model = new TokenExplorerItemModel();
            model.TransactionType = transaction.kind;

            switch (model.TransactionType.toLowerCase()) {
                case "mint":
                    this.#Update_ModelItem_common_values(model, transaction.mint[0]);
                    break;
                case "burn":
                    this.#Update_ModelItem_common_values(model, transaction.burn[0]);
                    break;
                case "transfer":
                    this.#Update_ModelItem_common_values(model, transaction.transfer[0]);
                    break;
                default:
                    continue;
            }

            model.DateTimeString = this.#TimeTicksNanoseconds_To_DateTimeString(transaction.timestamp);
            model.txIndex = Number(transaction.index);
            transactions[i] = model;
        }
        return transactions;
    }

    async Get_TransactionsCount(){

        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let count = await actor.get_total_tx();
        return count;
    }

    async Get_TransactionsByPrincipal(principal, start, length) {
        
        let transactionsResponse = await this.#GetTransactionyByPrincipal_internal(principal,start, length);           
        const transactions = await this.#ConvertTransactionResponseIntoOwnArray(transactionsResponse);

        return transactions;
    };

    async Get_TransactionsByPrincipalCount(principal){
        
        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let formattedPrincipalText = principal.replace(" ","");
        let principalObj = CommonTypes.Principal.fromText(formattedPrincipalText);
        let count = await actor.get_transactions_by_principal_count(principalObj);        
        return count;
    }



    async #Get_transactionsByIndex_internal(start, length) {
        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let transactions = await actor.get_transactions_by_index(start, length);     
        return transactions;
    };

    async #GetTransactionyByPrincipal_internal(principalText, start, length) {
        
        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let formattedPrincipalText = principalText.replace(" ","");
        let principalObj = CommonTypes.Principal.fromText(formattedPrincipalText); 
        let transactions = await actor.get_transactions_by_principal(principalObj, start, length);
        return transactions;
    };

};