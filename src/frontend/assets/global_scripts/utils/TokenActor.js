import { idlFactory } from "../types/TokenInterface.js";
import { CommonTypes } from "../types/CommonTypes.js";


export class TokenActor{

    #actor = null;
    #localCanisterId = null;
    #mainNetCanisterId = null;
    #decimals = 8;


    constructor() {
        // Add constructor logic here
    }

    async Init(localCanisterId, maintnetCanisterId) {
  
        this.#localCanisterId = localCanisterId;
        this.#mainNetCanisterId = maintnetCanisterId;
    }

    GetActor = () => this.#getActorInternal();

    #getActorInternal = () => {

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





}