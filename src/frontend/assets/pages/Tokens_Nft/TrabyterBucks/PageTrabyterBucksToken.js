import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, init, GetTransactionsRequest } from "../../../global_scripts/types/TokenInterface.js";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { TokenExplorer } from "../Common/TokenExplorer.js";

export class PageTrabyterBucks {

    #frontendId = "TraBucks_";
    #transactions = null;
    #tokenExplorer = null;
    #wasInitDone = false;
    #explorerMaxItemsPerPage = 10;
    #useFilterFromTokenExplorerInputField = false;
    #filterTxId = null;
    #filterByPrincipal = null;
    #filterByPrincipalCurrentShownLowIndex = 0;
    #filterByPrincipalCurrentShownHighIndex = 0;

    //The startindex of the transactions to show where this index is relative to the index of the last transaction
    #explorerTxId_StartIndex = null;
    #totalTxCount = 0;

    constructor() {
        console.log("PageTokens constructor");
    }

    async Page_TrabyterBucks_Init() {

        console.log("Page_TrabyterBucks_Init");
        if (this.#wasInitDone == true) {
            return;
        }

        // Some variables should be set to default values
        this.#explorerMaxItemsPerPage = 10;
        this.#explorerTxId_StartIndex = 0;

        console.log("Page_TrabyterBucks_Token_Init");

        this.#tokenExplorer = new TokenExplorer();
        //await this.#tokenExplorer.Init(this.#frontendId, "br5f7-7uaaa-aaaaa-qaaca-cai", "2mjwp-daaaa-aaaak-qimya-cai");
        await this.#tokenExplorer.Init(this.#frontendId, "be2us-64aaa-aaaaa-qaabq-cai", "zk4ae-aqaaa-aaaak-qiula-cai");

        document.getElementById(this.#frontendId + "rows_dropdown").onchange = async (event) => {

            console.log("rows_dropdown");
            let value = Number(event.target.value);
            this.#explorerMaxItemsPerPage = value;
            await this.Page_TrabyterBucks_Update();
        };

        let arrow_left_rewind = document.getElementById(this.#frontendId + "control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "control-button-right");
        let arrow_right_fastforward = document.getElementById(this.#frontendId + "control-button-right-forward");
        let filter_input_field_control = document.getElementById(this.#frontendId + "token_explorer_input_field");

        filter_input_field_control.addEventListener("keypress", async (event) => {            
            if (event.key === "Enter") {
                await this.#Page_TrabyterBucks_Update_By_Filter();             
            }
        });

        arrow_left_rewind.onclick = async (event) => {
            
            if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
                this.#RemoveAllSetFilters();               
            } 
            
            var totalTx = 0;
            if (this.#filterByPrincipal != null){
                totalTx = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
            }
            else{
                totalTx = await this.#tokenExplorer.Get_TransactionsCount();
            }
            this.#explorerTxId_StartIndex = Math.max(Number(totalTx) - 1, 0);
            
            
            await this.Page_TrabyterBucks_Update();
        };
        arrow_left.onclick = async (event) => {            

            //this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) - Number(this.#explorerMaxItemsPerPage), 0);
            
            if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
            
                this.#RemoveAllSetFilters();               
            } 
                
            this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) + Number(this.#explorerMaxItemsPerPage), 0);                        
            await this.Page_TrabyterBucks_Update();
        }

        arrow_right_fastforward.onclick = async (event) => {

            //this.#explorerTxId_StartIndex = Math.max(Number(this.#totalTxCount) - Number(this.#explorerMaxItemsPerPage), 0);
            if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
                this.#RemoveAllSetFilters();
              
            } 
            this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerMaxItemsPerPage)-1, 0);            
            await this.Page_TrabyterBucks_Update();
        }

        arrow_right.onclick = async (event) => {
            console.log("arrow_right: ");
            //this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) + Number(this.#explorerMaxItemsPerPage), 0);
            if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
                
                console.log("Remove all Filters");
                this.#RemoveAllSetFilters();                                    
            }                                                       
                
            console.log("this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);
            this.#explorerTxId_StartIndex = Math.max(Number(this.#explorerTxId_StartIndex) - Number(this.#explorerMaxItemsPerPage), 0);                       
            await this.Page_TrabyterBucks_Update();
        }

        let button_token_Explorer_Filter = document.getElementById(this.#frontendId + "token_explorer_input_field_button");
        button_token_Explorer_Filter.onclick = async (event) => {
            await this.#Page_TrabyterBucks_Update_By_Filter();
        };
        this.#wasInitDone = true;

        //TODO: remove later
        await this.Page_Is_Shown();
    }

    async Page_Is_Shown() {        

        console.log("Page_Is_Shown");
        this.#RemoveAllSetFilters();
        this.#transactions = null;        
        this.#explorerMaxItemsPerPage = 10;        
        this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();

        console.log("this.#totalTxCount: " + this.#totalTxCount);   
        this.#explorerTxId_StartIndex = Math.max( Number(this.#totalTxCount) - Number(1), Number(0));
        console.log("this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);

        await this.Page_TrabyterBucks_Update();
        console.log("OK. Page_Is_Shown");

    };

    #Get_shown_first_tx_index() {

        if (this.#transactions == null || this.#transactions.length == 0) {
            return 0;
        }
        return this.#transactions[0].txIndex;
    }

    #Get_shown_last_tx_index() {
        
        if (this.#transactions == null || this.#transactions.length == 0) {
            return 0;
        }
        let shownTxLength = this.#transactions.length;

        return this.#transactions[shownTxLength-1].txIndex;
    }

    async #Page_TrabyterBucks_Update_By_Filter() {

        console.log("#Page_TrabyterBucks_Update_By_Filter");

        let filterInputFieldControl = document.getElementById(this.#frontendId + "token_explorer_input_field");
        console.log("button_token_Explorer_Filter: " + filterInputFieldControl);
        let textValue = filterInputFieldControl.value;
        console.log("button_token_Explorer_Filter: " + textValue);

        if (this.#isNullOrWhiteSpace(textValue)) {
          
            this.#RemoveAllSetFilters();
            this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();            
            this.#explorerTxId_StartIndex = Math.max( Number(this.#totalTxCount) - Number(1), Number(0));        
            await this.Page_TrabyterBucks_Update();

        } else if (this.#IsStringANumber(textValue)) {
                          
            this.#useFilterFromTokenExplorerInputField = true;
            this.#filterTxId = Number(textValue);
            this.#filterByPrincipal = null;
            console.log("1.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);
            this.#explorerTxId_StartIndex = Number(textValue);
            console.log("2.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);
            await this.Page_TrabyterBucks_Update();
            console.log("3.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);
        } else {
            console.log("textValue is a principal");
            this.#useFilterFromTokenExplorerInputField = true;
            this.#filterTxId = null;
            this.#filterByPrincipal = textValue;
            let txCount = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
            let index = Math.max(Number(txCount) - 1, 0);
            this.#explorerTxId_StartIndex = index;
            await this.Page_TrabyterBucks_Update();
        };
    };

    #IsStringANumber(str) {
        let isNumber=  !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false){
            return false;
        };        
        return true;

      };

    #IsStringIsAPositiveNumber(str) {
        let isNumber=  !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false){
            return false;
        };
        let number = Number(str);
        if (number < 0){
            return false;
        };
        return true;

      };

    #RemoveAllSetFilters(){
        this.#useFilterFromTokenExplorerInputField = false;
        this.#filterTxId = null;
        this.#filterByPrincipal = null;
        document.getElementById(this.#frontendId + "token_explorer_input_field").value = "";

    };

    #isNullOrWhiteSpace(str) {
        return str === null || str === undefined || str.replace(' ', '').length === 0;
    };

    async Page_TrabyterBucks_Update() {

        console.log("Page_TrabyterBucks_Update");
        console.log("0x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
        
        /*
        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterTxId != null) {
                    
            console.log("this.#filterTxId: " + this.#filterTxId);   
            // Get the transactions count
            let totalTxCount  = await this.#tokenExplorer.Get_TransactionsCount();
            var indexToFind = Number(this.#filterTxId);
            if (indexToFind < 0 || indexToFind > totalTxCount){
                this.#transactions = [];
                
            }
            else {

                this.#totalTxCount = totalTxCount;
                var txId =  Number(this.#filterTxId) - Number(this.#explorerMaxItemsPerPage) + 1;
                txId = Math.min(Number(txId), Number(this.#totalTxCount));
                if (txId < 0){
                    txId = 0;
                }

                this.#transactions = await this.#tokenExplorer.Get_Transactions(txId, Number(this.#explorerMaxItemsPerPage));
                this.#explorerTxId_StartIndex = Number(this.#totalTxCount) - Number(txId);
            };              
            await this.#Update_TokenExplorerItems();
            await this.#Page_TrabyterBucks_UpdateTransactions_Legends();
            
            // } else if (this.#filterByPrincipal != null) {
                    
            //         // Get the transactions count                
            //         this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
                   
            //         // Get the transactions     
            //         let relIndex = Number(Number(this.#totalTxCount) - Number(this.#explorerMaxItemsPerPage) - Number(this.#explorerTxId_StartIndex));

            //         let minNumber = Number(0);

            //         let txStartIndex = Number(Math.max(relIndex, minNumber));
            //         this.#transactions = await this.#tokenExplorer.Get_Transactions(txStartIndex, Number(this.#explorerMaxItemsPerPage));
                  
            //         await this.#Update_TokenExplorerItems();
            //         await this.#Page_TrabyterBucks_UpdateTransactions_Legends();

            // }

        }
        else
        */
        {       
            // Get the transactions count                   
            if (this.#filterByPrincipal != null){                
                console.log("this.#filterByPrincipal: " + this.#filterByPrincipal); 
                 this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsByPrincipalCount(this.#filterByPrincipal);
                 console.log("this.#totalTxCount: " + this.#totalTxCount);
            } else
            {                
                this.#totalTxCount = await this.#tokenExplorer.Get_TransactionsCount();
            }
                        
            // Get the transactions 
            console.log("1x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
            let relIndex = Number(Number(this.#explorerTxId_StartIndex) - Number(this.#explorerMaxItemsPerPage) + Number(1));
            let minNumber = Number(0);
            let txStartIndex = Number(Math.max(relIndex, minNumber));
            console.log("2x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
            console.log("txStartIndex: " + txStartIndex);
            

            let lengthToUse = Number(this.#explorerMaxItemsPerPage);
            if (Number(this.#explorerTxId_StartIndex) - lengthToUse + 1 < 0){
                lengthToUse = Number(this.#explorerTxId_StartIndex) + 1;                
                txStartIndex = 0;                                
            }
            if (this.#filterByPrincipal != null){                
                console.log("this.#filterByPrincipal: " + this.#filterByPrincipal);
                this.#transactions = await this.#tokenExplorer.Get_TransactionsByPrincipal(this.#filterByPrincipal,txStartIndex, Number(lengthToUse));
                console.log("this.#transactions: ");
                console.log(this.#transactions);
           } else
           {                
            this.#transactions = await this.#tokenExplorer.Get_Transactions(txStartIndex, Number(lengthToUse));
           }

           console.log("3x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
          
            await this.#Update_TokenExplorerItems();
            console.log("4x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
            await this.#Page_TrabyterBucks_UpdateTransactions_Legends();
            console.log("5x.) this.#explorerTxId_StartIndex: " + this.#explorerTxId_StartIndex);    
        } 
        
    }

    async #Page_TrabyterBucks_UpdateTransactions_Legends() {
        console.log("Page_TrabyterBucks_UpdateTransactions_Legends");
        // The highest index of the transactions shown
        let shownHighestTxIndex = this.#Get_shown_first_tx_index();

        // The lowest index of the transactions shown
        let shownLowestTxIndex = this.#Get_shown_last_tx_index();

        if (this.#useFilterFromTokenExplorerInputField == true && this.#filterByPrincipal != null) {
            shownHighestTxIndex = this.#explorerTxId_StartIndex;

            shownLowestTxIndex = this.#explorerTxId_StartIndex - this.#transactions.length + 1;
        }

        //let minIndexShown = this.#explorerTxId_StartIndex;
        //let transactionsCount = this.#transactions.length;
        //let maxIndexShown = Number(minIndexShown) + Math.min(Number(transactionsCount), Number(this.#explorerMaxItemsPerPage));
        console.log("shownHighestTxIndex: " + shownHighestTxIndex);
        console.log("shownLowestTxIndex: " + shownLowestTxIndex);
        console.log("this.#totalTxCount: " + this.#totalTxCount);

        let arrow_left_rewind = document.getElementById(this.#frontendId + "control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "control-button-right");
        let arrow_right_fastforward = document.getElementById(this.#frontendId + "control-button-right-forward");
        if (arrow_left_rewind != null) {

            if (shownHighestTxIndex + 1 < this.#totalTxCount) {
                arrow_left_rewind.className = "control-button-left-rewind-highlight";
            } else {
                arrow_left_rewind.className = "control-button-left-rewind";
            }
        }

        if (arrow_left != null) {
            if (shownHighestTxIndex + 1 < this.#totalTxCount) {
                arrow_left.className = "control-button-left-highlight";
            } else {
                arrow_left.className = "control-button-left";
            }
        }

        if (arrow_right != null) {
            if (shownLowestTxIndex > 0) {            
                arrow_right.className = "control-button-right-highlight";
            } else {
                arrow_right.className = "control-button-right";
            }
        }
        if (arrow_right_fastforward != null) {
            if (shownLowestTxIndex > 0) {            
                arrow_right_fastforward.className = "control-button-right-forward-highlight";
            } else {
                arrow_right_fastforward.className = "control-button-right-forward";
            }
        }
    }

    async #Update_TokenExplorerItems() {

        let id = this.#frontendId + "TokenExplorer";
        let tableElement = document.getElementById(id);

        if (tableElement == null) {
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


    #Get_TokenExplorerTableEndContentString() {

        return " </table>";
    }

    #Get_TokenExplorerTableStartContentString() {

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

    #Get_amount_string(amount) {
        let returnValue = Number(amount).toFixed(3);
        return returnValue;
    }

    #Get_TokenExplorerTableRowStringByModel(model) {

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
                                <p class='control-table-cell-text'>` + this.#Get_amount_string(model.Amount) + ` TRA</p>
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