import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, init,GetTransactionsRequest } from "../../../global_scripts/types/TokenInterface.js";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { TokenExplorer } from "../Common/TokenExplorer.js";

export class PageTrabyterBucks {

    #frontendId = "TrabyterBucks";
    #transactions = null;    
    #tokenExplorer = null;
    #wasInitDone = false;

    #explorerMaxItemsPerPage = 50;
    #explorerTxId_StartIndex = 0;
    #txCount = 0;

    constructor() {
        console.log("PageTokens constructor");
    }
    
    async Page_TrabyterBucks_Init() {
                       
        if (this.#wasInitDone == true) {
            return;
        }

        console.log("Page_TrabyterBucks_Token_Init");

        this.#tokenExplorer = new TokenExplorer();
        await this.#tokenExplorer.Init(this.#frontendId, "be2us-64aaa-aaaaa-qaabq-cai", "2mjwp-daaaa-aaaak-qimya-cai");

        this.#wasInitDone = true;
    }

    async Page_TrabyterBucks_Update() {
        // Some variables should be set to default values
        this.#explorerMaxItemsPerPage = 50;
        this.#explorerTxId_StartIndex = 0;

        // Get the transactions count
        this.#txCount = await this.#tokenExplorer.Get_TransactionsCount();
        
        // Get the transactions
        let relIndex = Number( Number(this.#txCount) - Number(this.#explorerMaxItemsPerPage)
        + Number(this.#explorerTxId_StartIndex));
        let minNumber = Number(0);
        
        let txStartIndex = Number(Math.max(relIndex, minNumber));                
        this.#transactions = await this.#tokenExplorer.Get_Transactions(txStartIndex, Number(this.#explorerMaxItemsPerPage));         
        console.log("this.#transactions: ");
        console.log(this.#transactions);

        await this.#Update_TokenExplorerItems();
    }


    async #Update_TokenExplorerItems(){
        
        let id = this.#frontendId + "_TokenExplorer";
        let tableElement = document.getElementById(id);

        if (tableElement == null){
            return;
        }

        let tableHtmlString = this.#Get_TokenExplorerTableStartContentString();

        if (this.#transactions != null && this.#transactions.length > 0) {

            for (let i = 0; i < this.#transactions.length; i++) {
                let model = this.#transactions[i];
                let rowString = this.#Get_TokenExplorerTableRowStringByModel(model);
                tableHtmlString += rowString;
            }
        };

        tableHtmlString += this.#Get_TokenExplorerTableEndContentString();
        tableElement.innerHTML = tableHtmlString;
        tableElement.style.display = "block";
    }


    #Get_TokenExplorerTableEndContentString(){

        return " </table>";
    }

    #Get_TokenExplorerTableStartContentString(){

        let returnString = `
            <table cellspacing='0em' cellpadding='0em'  
            style='width: 100%; 
            padding-left: 1em; padding-right: 1em;'>
                <colgroup>
                    <col style='width: 10em; min-width: 10em;'>
                    <col style='width: 20em; min-width: 20em;'>
                    <col style='width: 10em; min-width: 10em;'>
                    <col style='width: 15em; min-width: 15em;'>
                    <col style='width: 45em; min-width: 45em;'>
                    <col style='width: auto; min-width: 45em;'>
                </colgroup>

                <tr>
                    <td >
                        <p class='control-table-header-text'>Tx Id</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Date</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Type</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>Amount</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>From</p>
                    </td>
                    <td >
                        <p class='control-table-header-text'>To</p>
                    </td>

                    <td>

                    </td>
                </tr>
        
                <tr >
                    <td colspan='6' >
                        <div style='width: 100%;height: 0.2em; background-color: white;vertical-align: top;'></div>
                    </td>
                </tr>
                <tr style='height: 2em;'>
                    <td></td>
                </tr>`;

        return returnString;                                    
    }

    #Get_amount_string(amount){
        let returnValue = Number(amount).toFixed(3);
        return returnValue;
    }

    #Get_TokenExplorerTableRowStringByModel(model){

        let returnString = `
        <tr class='spaceUnder' >                          
            <td colspan='6'>
                <div class='control-table-cell-div-content'  >
                    <table cellspacing='0em' cellpadding='0em' style='width: 100%;'  >
                        <colgroup>
                            <col style='width: 10em; min-width: 10em;'>
                            <col style='width: 20em; min-width: 20em;'>
                            <col style='width: 10em; min-width: 10em;'>
                            <col style='width: 15em; min-width: 15em;'>
                            <col style='width: 45em; min-width: 45em;'>
                            <col style='width: auto; min-width: 45em;'>
                        </colgroup>
                        <tr style='margin: 0em; padding: 0em;'>
                            <td style='padding-left: 1em;padding-top: 0.1em; vertical-align: top;text-align: right;'>
                                <p class='control-table-cell-text'
                                style='text-align: right;margin-right: 2em;'
                                >` + model.txIndex + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.DateTimeString + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em; '>
                                <p class='control-table-cell-text'>` + model.TransactionType + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + this.#Get_amount_string(model.Amount) + `</p>
                            </td>                                                    
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.From + `</p>
                            </td>
                            <td style='vertical-align: top;padding-top: 0.1em;'>
                                <p class='control-table-cell-text'>` + model.To + `</p>
                            </td>                                                                                                                                                                          
                        </tr>
                        <tr>
                            <td>

                            </td>
                        </tr>
                    </table>                                              
                </div> 
            </td>                                                                                                                                                                                            
        </tr>`;
        return returnString;
    }

    // async Add_TokenExplorerItemFromModel(){


    // }

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