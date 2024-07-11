import {PubSub } from "../scripts/utils/PubSub";
import {CommonIdentityProvider, WalletTypes} from "../scripts/types/CommonTypes";
import { HelloWorld } from "../scripts/utils/CommonUtils";
/// react on Identity changed. (login, logout, etc..)
async function IdentityChanged() {

    console.log("In method IdentityChanged");
    let identityProvider = CommonIdentityProvider;
    let labelInfo = document.getElementById("labelWalletConnectionStatus");
  
    let usersIdentity = identityProvider.UsersIdentity;
    if (usersIdentity.IsConnected == false) {
      labelInfo.innerHTML = "Status: Not connected to a wallet"
    }
    else {
      labelInfo.innerHTML = "Status: connected to " + usersIdentity.Name + "</br>" + usersIdentity.AccountPrincipalText;
    }     
  }


/* When the user clicks on the button,
toggle between hiding and showing the dropdown content of button 'Wallet Connection' */
function OnToggleWalletDropDownMenu() {
    document.getElementById("dropDownWalletMenu").classList.toggle("show");
  }
  
  //Close the dropdown menu if the user clicks outside of it
  window.onclick = function (event) {
    if (!event.target.matches('.dropbtn')) {
      var dropdowns = document.getElementsByClassName("dropdown-content");
      var i;
      for (i = 0; i < dropdowns.length; i++) {
        var openDropdown = dropdowns[i];
        if (openDropdown.classList.contains('show')) {
          openDropdown.classList.remove('show');
        }
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

  document.addEventListener('DOMContentLoaded', async function () {
  //alert('moin');
  //document.domain = 'icp0.io';
    console.log("init");
    PubSub.subscribe('index_js_UserIdentityChanged', 'UserIdentityChanged', IdentityChanged);
    await CommonIdentityProvider.Init();
      
    document.getElementById("buttontest").addEventListener('click', function () { ButtonTestClicked(); }, false);

    document.getElementById("buttonWalletDropDown").addEventListener('click', function () { OnToggleWalletDropDownMenu(); }, false);
    document.getElementById("loginPlug").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.plug) }, false);
    document.getElementById("loginStoic").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.stoic) }, false);
    document.getElementById("logout").addEventListener('click', async function () { await CommonIdentityProvider.Logout() }, false);
    console.log("init done");
  }, false)

  

