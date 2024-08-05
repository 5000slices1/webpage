import {PubSub } from "../scripts/utils/PubSub";
import {CommonIdentityProvider, WalletTypes} from "../scripts/types/CommonTypes";
import { HelloWorld } from "../scripts/utils/CommonUtils";

/// react on Identity changed. (login, logout, etc..)
async function IdentityChanged() {

    console.log("In method IdentityChanged");
    


    /* TODO: for later
    let identityProvider = CommonIdentityProvider;
    let labelInfo = document.getElementById("labelWalletConnectionStatus");
  
    let usersIdentity = identityProvider.UsersIdentity;
    if (usersIdentity.IsConnected == false) {
      labelInfo.innerHTML = "Status: Not connected to a wallet"
    }
    else {
      labelInfo.innerHTML = "Status: connected to " + usersIdentity.Name + "</br>" + usersIdentity.AccountPrincipalText;
    }     
    */
  }



  function MainNavButtonClicked(button){
    button.classList.add("main-header-button-selected");
    var id = button.getAttribute("id");

    if (id=="navButtonTokensNft"){

      document.getElementById("sub-navigation-div").style.display = "block";    
    } else{
      document.getElementById("sub-navigation-div").style.display = "none";
    }

    var divMainMenu = document.getElementById("divMainMenu");
    var buttons = document.getElementsByClassName("main-header-button");
    for (var i = 0; i < buttons.length; i++) {
      var currentId = buttons[i].getAttribute("id");
      if (currentId != id) {        
        buttons[i].classList.remove("main-header-button-selected");
      }
    }
  }

  function SubNavButtonClicked(button){  
    console.log("subnavbuttonclicked");
    var subNavigationDiv = document.getElementById("sub-navigation-div");
    var buttons = subNavigationDiv.getElementsByClassName("sub-navigation-button");
    for (var i = 0; i < buttons.length; i++) {
      let buttonId = buttons[i].getAttribute("id");   
      console.log(buttonId);     
      let lineId = buttonId+"Line";
      let currentButton = buttons[i];
      let currentLine = document.getElementById(lineId); 

      if (buttons[i] != button) {
        
        currentButton.classList.remove("sub-navigation-button-selected");
        currentLine.classList.remove("sub-navigation-button-horizontal-line-selected");
      } else {
        currentButton.classList.add("sub-navigation-button-selected");
        currentLine.classList.add("sub-navigation-button-horizontal-line-selected");        
      }
    }
  }

  function ButtonTestClicked(){
    console.log("web3: test clicked");    
    // console.log("frames.frame_swap");
    // console.log(frames.frame_swap);
    // frames.frame_swap.bla="hello";

    // let event = new Event('wallet_identity_changed');
    // window.slicesevent = event;
    // window.slicesevent.dispatchEvent( new Event('wallet_identity_changed') );
    // window.postMessage("WALLET_IDENITTY_CHANGED", 'http://127.0.0.1:4943/');   
    //window.postMessage("WALLET_IDENITTY_CHANGED", 'https://fw7s5-6yaaa-aaaap-ahktq-cai.icp0.io/');   
    //window.postMessage("WALLET_IDENITTY_CHANGED", 'https://un4mp-rqaaa-aaaal-ajmwq-cai.icp0.io/');   
    //window.postMessage("WALLET_IDENITTY_CHANGED", "*");   
    HelloWorld();
    console.log(window);
    //document.getElementById('cross_domain_swapapp').contentWindow.postMessage(window.ic.plug, "*");
    //document.getElementById('cross_domain_swapapp').contentWindow.postMessage("WALLET_IDENITTY_CHANGED", "*");
    
    
    //window.postMessage(CommonIdentityProvider.GetAdapter(), 'https://fw7s5-6yaaa-aaaap-ahktq-cai.icp0.io/');   
          
    //console.log("post message was sent.");
    //console.log(window);  
    }

    /* When the user clicks on the button,
toggle between hiding and showing the dropdown content of button 'Wallet Connection' */

function OnToggleWalletDropDownMenu() {
  console.log("OnToggleWalletDropDownMenu");
  document.getElementById("dropDownWalletMenu").classList.toggle("show");

}

//Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (!event.target.matches('.walletLoginButton')) {
    var dropdowns = document.getElementsByClassName("wallet-control-not-logged-in");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

  document.addEventListener('DOMContentLoaded', async function () {
  
  //document.domain = 'icp0.io';
    console.log("init");

   
    let navButtonHome = document.getElementById("navButtonHome");
    let navButtonNews = document.getElementById("navButtonNews");
    let navButtonApps = document.getElementById("navButtonApps");
    let navButtonTokensNft = document.getElementById("navButtonTokensNft");
    let navButtonWhitepaper = document.getElementById("navButtonWhitepaper");
    let navButtonRoadmap = document.getElementById("navButtonRoadmap");


    // Main navigation buttons
    navButtonHome.addEventListener('click', function () { MainNavButtonClicked(navButtonHome); }, false);
    navButtonNews.addEventListener('click', function () { MainNavButtonClicked(navButtonNews); }, false);
    navButtonApps.addEventListener('click', function () { MainNavButtonClicked(navButtonApps); }, false);
    navButtonTokensNft.addEventListener('click', function () { MainNavButtonClicked(navButtonTokensNft); }, false);
    navButtonWhitepaper.addEventListener('click', function () { MainNavButtonClicked(navButtonWhitepaper); }, false);
    navButtonRoadmap.addEventListener('click', function () { MainNavButtonClicked(navButtonRoadmap); }, false);
    
    // Sub navigation buttons
    let secondNavButtonOverview = document.getElementById("secondNavButtonOverview");
    let secondNavButtonSliToken = document.getElementById("secondNavButtonSliToken");
    let secondNavButtonGldsToken = document.getElementById("secondNavButtonGldsToken");
    let secondNavButtonSlicesNft = document.getElementById("secondNavButtonSlicesNft");
 
    secondNavButtonOverview.addEventListener('click', function () { SubNavButtonClicked(secondNavButtonOverview); }, false);
    secondNavButtonSliToken.addEventListener('click', function () { SubNavButtonClicked(secondNavButtonSliToken); }, false);
    secondNavButtonGldsToken.addEventListener('click', function () { SubNavButtonClicked(secondNavButtonGldsToken); }, false);
    secondNavButtonSlicesNft.addEventListener('click', function () { SubNavButtonClicked(secondNavButtonSlicesNft); }, false);


  
    // Pubsub actions
    PubSub.subscribe('index_js_UserIdentityChanged', 'UserIdentityChanged', IdentityChanged);
    
    // Important init
    await CommonIdentityProvider.Init();
  
    // Wallet login button(s)
    document.getElementById("buttonWalletDropDown").addEventListener('click', function () { OnToggleWalletDropDownMenu(); }, false);
          
    document.getElementById("loginPlug").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.plug) }, false);
    document.getElementById("loginStoic").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.stoic) }, false);
    document.getElementById("logout").addEventListener('click', async function () { await CommonIdentityProvider.Logout() }, false);
    
    console.log("init done");
  }, false)

  

