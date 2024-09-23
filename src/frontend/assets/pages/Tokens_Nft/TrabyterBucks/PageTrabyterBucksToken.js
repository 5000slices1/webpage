import {PageTrabyterTokenExplorer} from "./TokenExplorer/PageTrabyterBucksTokenExplorer.js";
import {PageTrabyterTokenHolders} from "./Holders/PageTrabyterBucksTokenHolders.js";
import {fetchAndSetInnerHTML} from "../../../global_scripts/utils/CommonUtils.js";
import {CommonTypes} from "../../../global_scripts/types/CommonTypes.js";

export class PageTrabyterBucks {

    //#wasInitDone = false;
    #tokenExplorerPage = new PageTrabyterTokenExplorer();
    #tokenHoldersPage = new PageTrabyterTokenHolders();
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
        
        await this.Show_Page_Token_Information();
        //await this.Show_Page_Token_Explorer();
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

    async Left_Navigation_Button_Apply_Activated_Style(button){
        var id = button.id;
        
        button.classList.add("content-control-left-navigation-button-active");
        // console.log("button classlist");
        // console.log(button.classList);
        
        if (id != this.#leftNavButtonTokenInformation.id)
        {
            this.#leftNavButtonTokenInformation.classList.remove("content-control-left-navigation-button-active");
        }
        
        if (id != this.#leftNavButtonTokenExplorer.id)
        {
            this.#leftNavButtonTokenExplorer.classList.remove("content-control-left-navigation-button-active");
             
        }

        if (id != this.#leftNavButtonTokenHolders.id)
        {
            this.#leftNavButtonTokenHolders.classList.remove("content-control-left-navigation-button-active");
             
        }

        if (id != this.#leftNavButtonTokenInterface.id)
        {
            this.#leftNavButtonTokenInterface.classList.remove("content-control-left-navigation-button-active");             
        }        
    }

    async Show_Page_Token_Information() {

        await this.Left_Navigation_Button_Apply_Activated_Style(this.#leftNavButtonTokenInformation);
        this.#innerContentDiv.innerHTML = "";
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/Information/PageTrabyterBucksTokenInformation.html");
        await CommonTypes.LogicTrabyterBucksPriceFetcher.Init();
    }

    async Show_Page_Token_Explorer() {


        await  this.Left_Navigation_Button_Apply_Activated_Style(this.#leftNavButtonTokenExplorer);
        this.#innerContentDiv.innerHTML = "";
        
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/TokenExplorer/PageTrabyterBucksTokenExplorer.html");
        await this.#tokenExplorerPage.Init();
        
    };

    async Show_Page_Token_Holders(){
        
        await  this.Left_Navigation_Button_Apply_Activated_Style(this.#leftNavButtonTokenHolders);
        this.#innerContentDiv.innerHTML = "";
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/Holders/PageTrabyterBucksTokenHolders.html");
        await this.#tokenHoldersPage.Init();

    };

    async Show_Page_Token_Interface() {
        
        await this.Left_Navigation_Button_Apply_Activated_Style(this.#leftNavButtonTokenInterface);
        this.#innerContentDiv.innerHTML = "";
        await fetchAndSetInnerHTML(this.#innerContentDiv, "../assets/pages/Tokens_Nft/TrabyterBucks/Interface/PageTrabyterBucksTokenInterface.html");
        await CommonTypes.LogicTrabyterBucksTokenInterface.Init();
    }
   
    
}