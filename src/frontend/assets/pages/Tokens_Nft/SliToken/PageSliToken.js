import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../global_scripts/types/TokenInterface.js";


export class PageSliToken {

    tokenName = "Sli";

    constructor() {
        console.log("PageTokens constructor");
    }

    #getActor = () => {

        let isDevelopment = process.env.NODE_ENV == "development";

        console.log("process.env.NODE_ENV: " + process.env.NODE_ENV);

        if (isDevelopment){
            let canisterId = "be2us-64aaa-aaaaa-qaabq-cai";
            let host = "http://127.0.0.1:4943";
            let agent = new HttpAgent({ host });
            agent.fetchRootKey().catch(err=>{
                console.warn("Unable to fetch root key. Check to ensure that your local replica is running");
                console.error(err);
              });
            let actor = Actor.createActor(
                idlFactory,
                {
                    canisterId: canisterId,
                    agent: agent,           
                }
              );
              return actor;            
        } else {
            let canisterId = "2mjwp-daaaa-aaaak-qimya-cai";
            let host = "https://ic0.app";
            let agent = new HttpAgent({ host });           
            let actor = Actor.createActor(
                idlFactory,
                {
                    canisterId: canisterId,
                    agent: agent,              
                }
              );
              return actor;

        }
       
      };


    async Page_Sli_Token_Init() {
        console.log("Page_Sli_Token_Init");
        let idName = this.tokenName + "_LeftNavButtonTokenInformation";
        console.log(idName);

        let ele = document.getElementById(idName);
        console.log(ele);

        let actor = this.#getActor();
        
        let name = await actor.icrc1_name();
        console.log("Name from call: " +name);
        //alert('Tokens_Init');


    }


}