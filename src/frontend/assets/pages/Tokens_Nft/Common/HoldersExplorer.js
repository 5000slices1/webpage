import { idlFactory } from "../../../global_scripts/types/TokenInterface.js";
import { TokenHoldersItemModel } from "./TokenHoldersItemModel.js";
import { TokenBalance } from "./TokenBalance.js";
import { CommonTypes } from "../../../global_scripts/types/CommonTypes.js";
import { IDL } from "@dfinity/candid";

export class HoldersExplorer{

    #frontendId = "";
    #actor = null;
    #localCanisterId = null;
    #mainNetCanisterId = null;
    #decimals = 8;
    #totalHoldersCount = 0;
    #allHoldersInformation = null;

    constructor() {
        // Add constructor logic here
    }

    async Init(frontendId, localCanisterId, maintnetCanisterId) {
        this.#frontendId = frontendId;
        this.#localCanisterId = localCanisterId;
        this.#mainNetCanisterId = maintnetCanisterId;
        await this.#Retrieve_and_Cache_all_Data();
    }


    async #Retrieve_and_Cache_all_Data(){
        let actor = this.#getActor();
        if (actor == null){
            return null;
        }
        let allHoldersCount = await actor.get_holders_count();
        let holders = new Array(allHoldersCount);

        let step = 500;
        let currentIndex = 0;
        for(let i = 0; i < allHoldersCount; i += step){
            
            let param1 = BigInt(i);
            let param2 = BigInt(step);
            let tempHolders = await actor.get_holders([param1], [param2]);
      
            for(let j = 0; j < tempHolders.length; j++){
                let holder = tempHolders[j];
                
                let amount = new TokenBalance( BigInt(holder.balance), Number(this.#decimals))?.GetValue();

                if (amount > 0){
                    let model = new TokenHoldersItemModel();
                    model.Index = currentIndex;
                    model.Amount = amount;
                    model.Principal = CommonTypes.Principal.fromHex(holder.account.owner.toHex())?.toText();
                    holders[currentIndex] = model;
                    currentIndex++;
                }
            }
        };

        let resizedArray = new Array(currentIndex);
        for(let k=0; k<currentIndex; k++){

            resizedArray[k] = holders[k];
        }

        this.#allHoldersInformation = resizedArray.sort((a, b) => b.Amount - a.Amount);
        for(let z=0; z<this.#allHoldersInformation.length; z++){
            this.#allHoldersInformation[z].Index = z;
        }
        this.#totalHoldersCount= this.#allHoldersInformation.length;
          
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
   
    async Get_HoldersCount(){

        return this.#totalHoldersCount;        
    }

    async Get_HoldersCount_By_Principal(principal){
        let count = 0;
        for(let i=0; i<this.#allHoldersInformation.length; i++){
            if (this.#allHoldersInformation[i].Principal == principal){
                count++;
            }
        }
        return count;
    }

    async Get_Holders_ByPrincipal(principal){
        let holders = new Array(this.#allHoldersInformation.length);
        let currentIndex = 0;
        for(let i=0; i<this.#allHoldersInformation.length; i++){
            if (this.#allHoldersInformation[i].Principal == principal){
                holders[currentIndex] = this.#allHoldersInformation[i];
                currentIndex++;
            }
        }
        return holders;

    }

    async Get_Holders(start, length) {
        
        let maxIndex = start + length;
        if (maxIndex > this.#totalHoldersCount){
            maxIndex = this.#totalHoldersCount;
        }
        if (start >= this.#totalHoldersCount){
            return [];
        }

        let holders = new Array(maxIndex-start);

        var currentIndex = 0;
        for(let i=start; i<maxIndex; i++){
            holders[currentIndex] = this.#allHoldersInformation[i];
            currentIndex++;
        }
        return holders;
    }


    

};