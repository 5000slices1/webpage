import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../global_scripts/types/TokenInterface.js";
import { Principal } from "@dfinity/principal";
import { TokenExplorerItemModel } from "./TokenExplorerItemModel.js";


export class TokenExplorer{

    #frontendId = "";
    #actor = null;
    #localCanisterId = null;
    #mainNetCanisterId = null;

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
            let agent = new HttpAgent({ host });
            agent.fetchRootKey().catch(err=>{
                console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
                console.error(err);
              });
            let actor = Actor.createActor(
                idlFactory,
                {
                    canisterId: this.#localCanisterId,
                    agent: agent,           
                }
              );
              this.#actor = actor;              
        } else {
            
            let host = "https://ic0.app";
            let agent = new HttpAgent({ host });           
            let actor = Actor.createActor(
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

    async Get_Transactions(start, length) {
        let transactionsResponse = await this.#Get_transactionsByIndex_internal(start, length);

        const transactions = new Array(transactionsResponse.length);

        //Now we need to convert
        for (let i = 0; i < transactionsResponse.length; i++) {
            let transaction = transactionsResponse[i];
            let model = new TokenExplorerItemModel();
            model.TransactionType = transaction.TransactionType;
            model.Amount = transaction.Amount;
            model.DateTimeString = transaction.DateTimeString;
            model.From = transaction.From;
            model.To = transaction.To;
            transactions[i] = model;
        }

        return transactions;
    };

    async Get_TransactionsCount(){

        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let count = await actor.get_total_tx();
        return count;
    }


    async #Get_transactionsByIndex_internal(start, length) {
        let actor = this.#getActor();
        if (Actor == null){
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
        let principal = Principal.fromText(principalText);
        let transactions = await actor.get_transactions_by_principal(principal, start, length);
        return transactions;
    };

};