import { PubSub } from "../assets/global_scripts/utils/PubSub.js";

//TODO: undo
//import {CommonIdentityProvider, WalletTypes} from "../assets/global_scripts/types/CommonTypes.js";
import { CommonTypes } from "../assets/global_scripts/types/CommonTypes.js";

import { HelloWorld } from "../assets/global_scripts/utils/CommonUtils.js";
//import { Page_Tokens_Init } from "../assets/pages/Tokens/PageTokens.js";
//const _inDesigner = false;



/// react on Identity changed. (login, logout, etc..)
async function IdentityChanged() {

  if (CommonTypes.InDesigner == true) {
    return;
  }
  console.log("In method IdentityChanged");
  //TODO: for later
  let identityProvider = CommonTypes.CommonIdentityProvider;
  //let labelInfo = document.getElementById("labelWalletConnectionStatus");
 
  let usersIdentity = identityProvider.UsersIdentity;
  if (usersIdentity.IsConnected == false) {
    //labelInfo.innerHTML = "Status: Not connected to a wallet"
    console.log("Not connected to a wallet");
  }
  else {
    //labelInfo.innerHTML = "Status: connected to " + usersIdentity.Name + "</br>" + usersIdentity.AccountPrincipalText;
    console.log("Status: connected to " + usersIdentity.Name + "</br>" + usersIdentity.AccountPrincipalText);
  }     
  
}

// Main navigation button clicked
async function MainNavButtonStylingUpdate(button) {
  button.classList.add("main-header-button-selected");
  var id = button.getAttribute("id");

  if (id == "navButtonTokensNft") {

    document.getElementById("sub-navigation-div").style.display = "block";
  } else {
    document.getElementById("sub-navigation-div").style.display = "none";
  }
  
  // set other buttons to not selected
  //var divMainMenu = document.getElementById("divMainMenu");
  var buttons = document.getElementsByClassName("main-header-button");
  for (var i = 0; i < buttons.length; i++) {
    var currentId = buttons[i].getAttribute("id");
    if (currentId != id) {
      buttons[i].classList.remove("main-header-button-selected");
    }
  }
}

// Sub navigation button clicked
async function SubNavButtonStylingUpdate(button) {
  
  var subNavigationDiv = document.getElementById("sub-navigation-div");
  var buttons = subNavigationDiv.getElementsByClassName("sub-navigation-button");

  // Handle the button stylings
  for (var i = 0; i < buttons.length; i++) {
    let buttonId = buttons[i].getAttribute("id");    
    let lineId = buttonId + "Line";
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

function ButtonTestClicked() {
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


  //window.postMessage(CommonTypes.CommonIdentityProvider.GetAdapter(), 'https://fw7s5-6yaaa-aaaap-ahktq-cai.icp0.io/');   

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

function setInnerHTMLAndExecuteScripts(element, html) {
  const newContent = document.createRange().createContextualFragment(html);
  element.innerHTML = '';
  element.append(newContent);
}

async function fetchAndSetInnerHTML(innerDiv,htmlSource) {
  try {
      const response = await fetch(htmlSource);
      const data = await response.text();      
      innerDiv.innerHTML = data;      
  } catch (error) {
      console.error('Error fetching and setting inner HTML:', error);
  }
}


async function LoadDynamicHtmlPages() {
  let divMainContent = document.getElementById("divMainContent");

  let allInnerDivs = divMainContent.querySelectorAll("div");
  for (var i = 0; i < allInnerDivs.length; i++) {

    let innerDiv = allInnerDivs[i];     
    if (innerDiv.hasAttribute("mainContentPageId")) {
      let mainContentPageId = innerDiv.getAttribute("mainContentPageId");
      let htmlSource = innerDiv.getAttribute("html-source");
      
      await fetchAndSetInnerHTML(innerDiv,htmlSource);

    }
  }

  await CommonTypes.LogicTrabyterBucksToken.Page_TrabyterBucks_Init();
  //await CommonTypes.LogicTrabyterBucksToken.Page_TrabyterBucks_Update();  
  console.log(allInnerDivs);

}

function Get_div_main_content() {
  return document.getElementById("divMainContent");  
}

// #region Show Main Pages

async function Show_Page_Mainpage_Home(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/PageHome/PageHome.html");

}

async function Show_Page_Mainpage_News(){ 
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/PageNews/PageNews.html");
}

async function Show_Page_Mainpage_Apps(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/PageApps/PageApps.html");
}

async function Show_Page_Mainpage_TokensNft(){
  
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  let secondNavButtonOverview = document.getElementById("secondNavButtonOverview");
  await SubNavButtonStylingUpdate(secondNavButtonOverview); 
  await Show_Page_TokensNft_Overview();

}

async function Show_Page_Mainpage_Whitepaper(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/PageWhitepaper/PageWhitepaper.html");
}

async function Show_Page_Mainpage_Roadmap(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/PageRoadmap/PageRoadmap.html");
}

// #endregion Show Main Pages


// #region Show TokensNft Pages

async function Show_Page_TokensNft_Overview(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/Tokens_Nft/PageOverview/PageOverview.html");
} 

async function Show_Page_TokensNft_TraBucksToken(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";

  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/Tokens_Nft/TrabyterBucks/PageTrabyterBucksToken.html");
  await CommonTypes.LogicTrabyterBucksToken.Page_TrabyterBucks_Init();

}

async function Show_Page_TokensNft_TraPremiumToken(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";

  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/Tokens_Nft/TrabyterPremiumBucks/PageTrabyterPremiumBucksToken.html");
    await CommonTypes.LogicTrabyterPremiumBucksToken.Page_TrabyterPremiumBucks_Init();
}

async function Show_Page_TokensNft_SlicesNft(){
  let divMainContent = Get_div_main_content();
  divMainContent.innerHTML = "";
  await fetchAndSetInnerHTML(divMainContent, 
    "../assets/pages/Tokens_Nft/PageNfts/PageNfts.html");

}

// #endregion Show TokensNft Pages

document.addEventListener('DOMContentLoaded', async function () {
  
  CommonTypes.InDesigner = true;
  document.getElementById("sub-navigation-div").style.display = "none";
  
  let navButtonHome = document.getElementById("navButtonHome");
  await MainNavButtonStylingUpdate(navButtonHome);
  await Show_Page_Mainpage_Home();
  

   window.dispatchEvent( new Event('resize') );

  await CommonTypes.Init();
  // alert('hello');
  //document.domain = 'icp0.io';
  console.log("init");

  

  await AddEventHandlers();

  
  //LoadDynamicHtmlPages();

   // Pubsub actions
   PubSub.subscribe('index_js_UserIdentityChanged', 'UserIdentityChanged', IdentityChanged);


  console.log("init done");
}, false)



async function AddEventHandlers() {

  let navButtonHome = document.getElementById("navButtonHome");
  let navButtonNews = document.getElementById("navButtonNews");
  let navButtonApps = document.getElementById("navButtonApps");
  let navButtonTokensNft = document.getElementById("navButtonTokensNft");
  //let navButtonWhitepaper = document.getElementById("navButtonWhitepaper");
  //let navButtonRoadmap = document.getElementById("navButtonRoadmap");
  // Main navigation buttons
  navButtonHome.addEventListener('click', async function () {
    await MainNavButtonStylingUpdate(navButtonHome);
    await Show_Page_Mainpage_Home();
  }, false);

  navButtonNews.addEventListener('click', async function () {
    await MainNavButtonStylingUpdate(navButtonNews);
    await Show_Page_Mainpage_News();
  }, false);

  navButtonApps.addEventListener('click', async function () {
    MainNavButtonStylingUpdate(navButtonApps);
    await Show_Page_Mainpage_Apps();
  }, false);

  navButtonTokensNft.addEventListener('click', async function () {
    await MainNavButtonStylingUpdate(navButtonTokensNft);
    await Show_Page_Mainpage_TokensNft();
  }, false);

  // navButtonWhitepaper.addEventListener('click', async function () { 
  //   await MainNavButtonStylingUpdate(navButtonWhitepaper);
  //   await Show_Page_Mainpage_Whitepaper();
  // }, false);
  // navButtonRoadmap.addEventListener('click', async function () { 
  //   await MainNavButtonStylingUpdate(navButtonRoadmap); 
  //   await Show_Page_Mainpage_Roadmap();
  // }, false);
  // Sub navigation buttons
  let secondNavButtonOverview = document.getElementById("secondNavButtonOverview");
  let secondNavButtonTraBucksToken = document.getElementById("secondNavButtonTraBucksToken");
  let secondNavButtonTraPremiumToken = document.getElementById("secondNavButtonTraPremiumToken");
  let secondNavButtonSlicesNft = document.getElementById("secondNavButtonSlicesNft");

  secondNavButtonOverview.addEventListener('click', async function () {
    await SubNavButtonStylingUpdate(secondNavButtonOverview);
    await Show_Page_TokensNft_Overview();
  }, false);

  secondNavButtonTraBucksToken.addEventListener('click', async function () {
    await SubNavButtonStylingUpdate(secondNavButtonTraBucksToken);
    await Show_Page_TokensNft_TraBucksToken();
  }, false);

  secondNavButtonTraPremiumToken.addEventListener('click', async function () {
    await SubNavButtonStylingUpdate(secondNavButtonTraPremiumToken);
    await Show_Page_TokensNft_TraPremiumToken();
  }, false);

  secondNavButtonSlicesNft.addEventListener('click', async function () {
    await SubNavButtonStylingUpdate(secondNavButtonSlicesNft);
    await Show_Page_TokensNft_SlicesNft();
  }, false);

  // Wallet login button(s)
  document.getElementById("buttonWalletDropDown").addEventListener('click', function () { OnToggleWalletDropDownMenu(); }, false);

  if (CommonTypes.InDesigner != true) {

    // Important init
    await CommonTypes.CommonIdentityProvider.Init();

    document.getElementById("loginPlug").addEventListener('click', async function () { await CommonTypes.CommonIdentityProvider.Login(CommonTypes.WalletTypes.plug); }, false);
    document.getElementById("loginStoic").addEventListener('click', async function () { await CommonTypes.CommonIdentityProvider.Login(CommonTypes.WalletTypes.stoic); }, false);
    document.getElementById("logout").addEventListener('click', async function () { await CommonTypes.CommonIdentityProvider.Logout(); }, false);
  }
}

