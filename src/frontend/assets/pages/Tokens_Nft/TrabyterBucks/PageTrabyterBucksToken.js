import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory, init, GetTransactionsRequest } from "../../../global_scripts/types/TokenInterface.js";
import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import { TokenExplorer } from "../Common/TokenExplorer.js";
import {PageTrabyterTokenExplorer} from "./PageTrabyterBucksTokenExplorer.js";

import {fetchAndSetInnerHTML} from "../../../global_scripts/utils/CommonUtils.js";
export class PageTrabyterBucks {

    //#wasInitDone = false;
    #tokenExplorerPage = new PageTrabyterTokenExplorer();
    #frontendId = "TraBucks_";

    #leftNavButtonTokenExplorer;
    #leftNavButtonTokenInformation;
    #leftNavButtonTokenHolders;
    #leftNavButtonTokenInterface;
    #innerContentDiv;



    constructor() {
        console.log("PageTokens constructor");
    }

    async Page_TrabyterBucks_Init() {

        console.log("Page_TrabyterBucks_Init");
        // if (this.#wasInitDone == true) {
        //     return;
        // }             
        await this.Init_common_field_values();      
        this.Event_Handlers_Remove();
        this.Event_Handlers_Add();
        await this.Show_Page_Token_Explorer();
        // this.#wasInitDone = true;
    }

    async Init_common_field_values()
    {
        this.#leftNavButtonTokenExplorer = document.getElementById(this.#frontendId + "LeftNavButtonTokenExplorer");
        this.#leftNavButtonTokenInformation = document.getElementById(this.#frontendId + "LeftNavButtonTokenInformation");
        this.#leftNavButtonTokenHolders = document.getElementById(this.#frontendId + "LeftNavButtonTokenHolders");
        this.#leftNavButtonTokenInterface = document.getElementById(this.#frontendId + "LeftNavButtonTokenInterface");
        this.#innerContentDiv = document.getElementById(this.#frontendId + "Inner_Content_Div");
    };

    async Event_Handlers_Remove(){

        document.getElementById(this.#frontendId + "LeftNavButtonTokenInformation").onclick = null;
        document.getElementById(this.#frontendId + "LeftNavButtonTokenExplorer").onclick = null;        
        document.getElementById(this.#frontendId + "LeftNavButtonTokenHolders").onclick = null;        
        document.getElementById(this.#frontendId + "LeftNavButtonTokenInterface").onclick = null;        
    };

    async Event_Handlers_Add(){

 
        this.#leftNavButtonTokenInformation.onclick = 
        async () => {await this.Show_Page_Token_Information()};

        this.#leftNavButtonTokenExplorer.onclick =
        async () => {await this.Show_Page_Token_Explorer()};

        this.#leftNavButtonTokenHolders.onclick =
        async () => {await this.Show_Page_Token_Holders()};

        this.#leftNavButtonTokenInterface.onclick =
        async () => {await this.Show_Page_Token_Interface()};

       //TraBucks_LeftNavButtonTokenInformation'

    };

    async Show_Page_Token_Information() {

        
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksTokenInformation.html");
    }

    async Show_Page_Token_Explorer() {

        
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksTokenExplorer.html");
        this.#tokenExplorerPage.Init();
    };

    async Show_Page_Token_Holders(){
        
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksTokenHolders.html");

    };

    async Show_Page_Token_Interface() {
        
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksTokenInterface.html");
    }
   
    
}