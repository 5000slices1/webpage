import { HoldersExplorer } from "../../Common/HoldersExplorer.js";
import { TrabyterBucks_Constants } from "../TrabyterBucksConstants.js";
import {CommonTypes} from "../../../../global_scripts/types/CommonTypes.js";

export class PageTrabyterTokenHolders {
    #frontendId = "TraBucks_";
    #holders = null;
    #holdersExplorer = null;  
    #holdersMaxItemsPerPage = 10;
    #useFilterFromTokenHoldersInputField = false;
    #filterId = null;
    #filterByPrincipal = null;  
    #holdersId_StartIndex = null;
    #totalHoldersCount = 0;


    async Init() {

        console.log("PageTrabyterTokenHolders Init");
      

        // Some variables should be set to default values
        this.#holdersMaxItemsPerPage = 10;
        this.#holdersId_StartIndex = 0;
        this.#holdersExplorer = new HoldersExplorer();
        await this.#holdersExplorer.Init(this.#frontendId, 
            TrabyterBucks_Constants.LocalCanisterId,
            TrabyterBucks_Constants.MainnetCanisterId            
        );

        document.getElementById(this.#frontendId + "holders_rows_dropdown").onchange = null;
        document.getElementById(this.#frontendId + "holders_rows_dropdown").onchange = async (event) => {
            let value = Number(event.target.value);
            this.#holdersMaxItemsPerPage = value;
            await this.Update_All_Views();
        };

        this.Remove_All_Events();

        let arrow_left_rewind = document.getElementById(this.#frontendId + "holders_control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "holders_control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "holders_control-button-right");
        let arrow_right_forward = document.getElementById(this.#frontendId + "holders_control-button-right-forward");
        let filter_input_field_control = document.getElementById(this.#frontendId + "token_holders_input_field");

        filter_input_field_control.addEventListener("keypress", this.handleKeyPress.bind(this));
     
        arrow_left_rewind.onclick = async (event) => {await this.Arrow_left_rewind_Click();};
        arrow_left.onclick = async (event) => { await this.Arrow_left_Click();};
        arrow_right.onclick = async (event) => { await this.Arrow_right_Click();};
        arrow_right_forward.onclick = async (event) =>  {await this.Arrow_right_forward_Click();};

        let button_token_Explorer_Filter = document.getElementById(this.#frontendId + "token_holders_input_field_button");        
        button_token_Explorer_Filter.onclick = async (event) => {await this.#Update_All_Views_By_Filter();};
      
        this.#RemoveAllSetFilters();

        this.#holders = null;
        this.#holdersMaxItemsPerPage = 10;
        this.#totalHoldersCount = await this.#holdersExplorer.Get_HoldersCount();
        this.#holdersId_StartIndex = 0;
        await this.Update_All_Views();

        document.getElementById(this.#frontendId + "TokenHolders").style.display = "block";
        document.getElementById(this.#frontendId + "TokenHolders_TableLegend").style.display = "block";

    }

    async Remove_All_Events() {
    
        let arrow_left_rewind = document.getElementById(this.#frontendId + "holders_control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "holders_control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "holders_control-button-right");
        let arrow_right_forward = document.getElementById(this.#frontendId + "holders_control-button-right-forward");
        let filter_input_field_control = document.getElementById(this.#frontendId + "token_holders_input_field");
        let button_token_Explorer_Filter = document.getElementById(this.#frontendId + "token_holders_input_field_button");
        
        if (button_token_Explorer_Filter != null) {
            button_token_Explorer_Filter.onclick = null;
        }
        

        if (filter_input_field_control != null) {
            filter_input_field_control.removeEventListener("keypress", this.handleKeyPress.bind(this));
        }

        if (arrow_left_rewind != null) {
            arrow_left_rewind.onclick = null;
        };

        if (arrow_left != null) {
            arrow_left.onclick = null;
        };

        if (arrow_right != null) {
            arrow_right.onclick = null;
        };

        if (arrow_right_forward != null) {
            arrow_right_forward.onclick = null;
        };

    };

    async Arrow_left_rewind_Click() {
        if (this.#useFilterFromTokenHoldersInputField == true && this.#filterId != null) {
            this.#RemoveAllSetFilters();
        }
        
        this.#holdersId_StartIndex = 0;        
        await this.Update_All_Views();
    };

    async Arrow_left_Click() {
        if (this.#useFilterFromTokenHoldersInputField == true && this.#filterId != null) {

            this.#RemoveAllSetFilters();
        }

        this.#holdersId_StartIndex = Math.max(Number(this.#holdersId_StartIndex) - Number(this.#holdersMaxItemsPerPage), 0);
        await this.Update_All_Views();
    };

    async Arrow_right_Click() {        
        if (this.#useFilterFromTokenHoldersInputField == true && this.#filterId != null) {
            this.#RemoveAllSetFilters();
        }

        var totalTx = 0;
        if (this.#filterByPrincipal != null) {
            totalTx = await this.#holdersExplorer.Get_HoldersCount_By_Principal(this.#filterByPrincipal);
        }
        else {
            totalTx = await this.#holdersExplorer.Get_HoldersCount();
        }

        this.#holdersId_StartIndex = Number(this.#holdersId_StartIndex) + Number(this.#holdersMaxItemsPerPage);
        if (this.#holdersId_StartIndex >= totalTx) {
            this.#holdersId_StartIndex = Math.max(Number(totalTx) - this.#holdersMaxItemsPerPage, 0);
        }
        await this.Update_All_Views();
    };

    async Arrow_right_forward_Click() {
        if (this.#useFilterFromTokenHoldersInputField == true && this.#filterId != null) {
            this.#RemoveAllSetFilters();

        }

        var totalTx = 0;
        if (this.#filterByPrincipal != null) {
            totalTx = await this.#holdersExplorer.Get_HoldersCount_By_Principal(this.#filterByPrincipal);
        }
        else {
            totalTx = await this.#holdersExplorer.Get_HoldersCount();
        }
        this.#holdersId_StartIndex = Number(totalTx) - this.#holdersMaxItemsPerPage;
        if (this.#holdersId_StartIndex < 0) {
            this.#holdersId_StartIndex = 0;
        }
        
        await this.Update_All_Views();
    };

    async handleKeyPress(event) {
        if (event.key === "Enter") {
            await this.#Update_All_Views_By_Filter();
        }
    }

    #Get_shown_first_tx_index() {

        if (this.#holders == null || this.#holders.length == 0) {
            return 0;
        }
        return this.#holders[0].Index;
    }

    #Get_shown_last_tx_index() {

        if (this.#holders == null || this.#holders.length == 0) {
            return 0;
        }
        let shownTxLength = this.#holders.length;
        
        return this.#holders[shownTxLength - 1].Index;
    }

    async #Update_All_Views_By_Filter() {

        let filterInputFieldControl = document.getElementById(this.#frontendId + "token_explorer_input_field");
        let textValue = filterInputFieldControl.value;

        if (this.#isNullOrWhiteSpace(textValue)) {

            this.#RemoveAllSetFilters();
            this.#totalHoldersCount = await this.#holdersExplorer.Get_HoldersCount();
            this.#holdersId_StartIndex = Math.max(Number(this.#totalHoldersCount) - Number(1), Number(0));
            await this.Update_All_Views();

        } else if (this.#IsStringANumber(textValue)) {

            this.#useFilterFromTokenHoldersInputField = true;
            this.#filterId = Number(textValue);
            this.#filterByPrincipal = null;
            this.#holdersId_StartIndex = Number(textValue);
            await this.Update_All_Views();
        } else {
            this.#useFilterFromTokenHoldersInputField = true;
            this.#filterId = null;
            this.#filterByPrincipal = textValue;
            let txCount = await this.#holdersExplorer.Get_HoldersCount_By_Principal(this.#filterByPrincipal);
            let index = Math.max(Number(txCount) - 1, 0);
            this.#holdersId_StartIndex = index;
            await this.Update_All_Views();
        };
    };

    async Update_All_Views() {

        // Get the transactions count                   
        if (this.#filterByPrincipal != null) {
            this.#totalHoldersCount = await this.#holdersExplorer.Get_HoldersCount_By_Principal(this.#filterByPrincipal);
        } else {
            this.#totalHoldersCount = await this.#holdersExplorer.Get_HoldersCount();
        }
      
        let txStartIndex = this.#holdersId_StartIndex;
        let lengthToUse = Number(this.#holdersMaxItemsPerPage);
    
        if (this.#filterByPrincipal != null) {
            this.#holders = await this.#holdersExplorer.Get_Holders_ByPrincipal(this.#filterByPrincipal);

        } else {
            this.#holders = await this.#holdersExplorer.Get_Holders(txStartIndex, Number(lengthToUse));
        }


        await this.#Update_TokenHolderItems();
        await this.#Update_Transactions_Legends();

    }

    async #Update_Transactions_Legends() {
        
        // The highest index of the transactions shown
        let shownLowestIndex = this.#Get_shown_first_tx_index();

        // The lowest index of the transactions shown
        let shownHighestIndex = this.#Get_shown_last_tx_index();
        

        if (this.#useFilterFromTokenHoldersInputField == true && this.#filterByPrincipal != null) {
            shownHighestIndex = this.#holdersId_StartIndex;

            shownLowestIndex = shownHighestIndex;
        }

        let arrow_left_rewind = document.getElementById(this.#frontendId + "holders_control-button-left-rewind");
        let arrow_left = document.getElementById(this.#frontendId + "holders_control-button-left");
        let arrow_right = document.getElementById(this.#frontendId + "holders_control-button-right");
        let arrow_right_fastforward = document.getElementById(this.#frontendId + "holders_control-button-right-forward");
        if (arrow_left_rewind != null) {

            if (shownLowestIndex > 0) {
                arrow_left_rewind.className = "control-button-left-rewind-highlight";
            } else {
                arrow_left_rewind.className = "control-button-left-rewind";
            }
        }

        if (arrow_left != null) {
            if (shownLowestIndex > 0) {            
                arrow_left.className = "control-button-left-highlight";
            } else {
                arrow_left.className = "control-button-left";
            }
        }

        if (arrow_right != null) {
            
            if (shownHighestIndex + 1 < this.#totalHoldersCount) {
                arrow_right.className = "control-button-right-highlight";
            } else {
                arrow_right.className = "control-button-right";
            }
        }
        if (arrow_right_fastforward != null) {
            
            if (shownHighestIndex + 1 < this.#totalHoldersCount) {            
                arrow_right_fastforward.className = "control-button-right-forward-highlight";
            } else {
                arrow_right_fastforward.className = "control-button-right-forward";
            }
        }

        let controlTxRange = document.getElementById(this.#frontendId + "TokenHolders_FromTo");
        let txRangeString =  this.#Get_shown_first_tx_index() + " - " + this.#Get_shown_last_tx_index() +"";
        controlTxRange.innerHTML = txRangeString;
    }

    async #Update_TokenHolderItems() {

  
        let id = this.#frontendId + "TokenHolders";
        let tableElement = document.getElementById(id);

        if (tableElement == null) {
            return;
        }

        let tableHtmlString = this.#Get_TokenHoldersTableStartContentString();
     

        if (this.#holders != null && this.#holders.length > 0) {

            for (let i = 0; i < this.#holders.length; i++) {
                let model = this.#holders[i];
                
                if (model != null && model.Index != null && model.Index != undefined) {                
                    let rowString = this.#Get_TokenHoldersTableRowStringByModel(model);
                    tableHtmlString += rowString;
                }
            }
        };

        tableHtmlString += this.#Get_TokenHoldersTableEndContentString();
        tableElement.innerHTML = tableHtmlString;
        tableElement.style.display = "block";
    
}


    #Get_TokenHoldersTableEndContentString() {

        return " </table>";
    }

    #Get_TokenHoldersTableStartContentString() {

        let returnString = `
                   <table cellspacing='0em' cellpadding='0em'  
        style='width: 65em; min-width:65em; 
        padding-left: 1em; padding-right: 1em;'>
            <colgroup>
                  <col style='width: 10em;'>
                  <col style='width: 14em;'>
                  <col style='width: 35em;'>            
                  <!-- <col style='width: auto;'> -->
            </colgroup>

            <tr>
                <td >
                    <p class='control-table-header-text' style="margin-left:1em;" >Position</p>
                </td>
                <td >
                    <p class='control-table-header-text'>Amount</p>
                </td>
                <td >
                    <p class='control-table-header-text'>Principal</p>
                </td>
                <!-- <td >
                    <p class='control-table-header-text'>Holder Information</p>
                </td> -->
               
                <td>

                </td>
            </tr>
    
            <tr >
                <td colspan='6' >
                    <div style='height: 0.2em; 
                    background-color: white;vertical-align: top;'></div>
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

    #Get_TokenHoldersTableRowStringByModel(model) {

        let returnString = `
         <tr class='spaceUnder' style='height:9em;min-height:9em;' >                          
                <td colspan='6' >
                    <div class='control-table-cell-div-content' style='height:7em;min-height:7em;'  >
                        <table cellspacing='0em' cellpadding='0em'   >
                            <colgroup>
                                <col style='width: 10em;'>
                                <col style='width: 14em;'>
                                <col style='width: 35em;'>                     
                                <!-- <col style='width: auto;'> -->
                            </colgroup>
                                          
                            <tr style='margin: 0em; padding: 0em;line-height: 1.8em;'>
                                
                          
                                <td style='vertical-align: top;padding-top: 0.1em;'>
                                    <p class='control-table-cell-text' style="margin-left:1em;">`+ model.Index + `</p>
                                </td>
                                <td style='vertical-align: top;padding-top: 0.1em;'>
                                    <p class='control-table-cell-text'>` + this.#Get_amount_string(model.Amount) + ` TRA</p>
                                </td>
                             
                             
                                <td style='vertical-align: top;padding-top: 0.1em;'>
                                    <p class='control-table-cell-text'>` + model.Principal + `</p>
                                </td>   
                              
                                                                                
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

    #IsStringANumber(str) {
        let isNumber = !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false) {
            return false;
        };
        return true;

    };

    #IsStringIsAPositiveNumber(str) {
        let isNumber = !isNaN(parseFloat(str)) && isFinite(str);
        if (isNumber == false) {
            return false;
        };
        let number = Number(str);
        if (number < 0) {
            return false;
        };
        return true;

    };

    #RemoveAllSetFilters() {
        this.#useFilterFromTokenHoldersInputField = false;
        this.#filterId = null;
        this.#filterByPrincipal = null;
        document.getElementById(this.#frontendId + "token_holders_input_field").value = "";

    };

    #isNullOrWhiteSpace(str) {
        return str === null || str === undefined || str.replace(' ', '').length === 0;
    };


};
