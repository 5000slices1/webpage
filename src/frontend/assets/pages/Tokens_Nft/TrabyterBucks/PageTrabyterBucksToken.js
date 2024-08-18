import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, init,GetTransactionsRequest } from "../../../global_scripts/types/TokenInterface.js";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { TokenExplorer } from "../Common/TokenExplorer.js";

export class PageTrabyterBucks {

    tokenName = "Sli";
    #transactions = null;    
    #tokenExplorer = null;

    constructor() {
        console.log("PageTokens constructor");
    }

    


    async Page_TrabyterBucks_Token_Init() {
        console.log("Page_Sli_Token_Init");

        this.#tokenExplorer = new TokenExplorer();
        this.#tokenExplorer.Init("bd3sg-teaaa-aaaaa-qaaba-cai", "2mjwp-daaaa-aaaak-qimya-cai");
    }




    // TODO: remove

    // let idName = this.tokenName + "_LeftNavButtonTokenInformation";
    // console.log(idName);

    // let ele = document.getElementById(idName);
    // console.log(ele);

    // let actor = this.#getActor();
    
    // let name = await actor.icrc1_name();
    // let totalTx = await actor.get_total_tx();

    // const req = ({
    //     'start' : 0,
    //     'length' : 200,
    //   });

    

    // console.log("Name from call: " +name);
    // console.log("Total Tx from call: " +totalTx);

    //IDL.encode([GetTransactionsRequest], { start: 0, length: 200 });
    //let arg = IDL.encode([GetTransactionsRequest], [IDL.Record({start:0 , length:20})]);
    //console.log("Arg from call: " +arg);
    //var arg2 = init.Record({start:IDL.Nat8, length:IDL.Nat8});
    //console.log("Arg2 from call: " +arg2);  
    //let arg3 = IDL.encode([arg2], {start:0, length:20});
    
    //console.log("Arg from call: " +arg);
    
    //console.log("Arg3 from call: " +arg3);
    //let transactions = await actor.get_transactions(req);
    // let transaction = await actor.get_transaction(0);
    // console.log("Transaction from call: ");
    // console.log(transaction);

    
    // console.log("Transactions from call: ");
    // let transactions = await actor.get_transactions_by_index(0,4);
    // console.log(transactions);

    // console.log("first");
    // console.log(transactions);

    // let principal = Principal.fromText("kwc6l-vpsdd-nnma2-roeo6-mqq2v-iotci-ner3z-syd65-vfhwl-iqyx6-eqe");
    // let txCountByPrincipal = await actor.get_transactions_by_principal_count(principal);
    // console.log("txCountByPrincipal: " + txCountByPrincipal);

    // let txByPrincipal = await actor.get_transactions_by_principal(principal, 0, 100);
    // console.log("txByPrincipal: ");
    // console.log(txByPrincipal);





    //alert('Tokens_Init');


}