



/// react on Identity changed. (login, logout, etc..)
async function IdentityChanged() {

    console.log("In method IdentityChanged");
    let walletInfo = CommonIdentityProvider.WalletsProvider;
    let labelInfo = document.getElementById("labelWalletConnectionStatus");
  
    let usersIdentity = walletInfo.UsersIdentity;
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

  document.addEventListener('DOMContentLoaded', async function () {


    PubSub.subscribe('index_js_UserIdentityChanged', 'UserIdentityChanged', IdentityChanged);
    await CommonIdentityProvider.Init();
  
    DynamicPageContentLoad(pageIds.mainContentPageId, pageIdValues.PageStartPage);
  
    DynamicPageContentLoad_InitHandlers(pageIds.mainContentPageId);
  
  
    document.getElementById("buttonWalletDropDown").addEventListener('click', function () { OnToggleWalletDropDownMenu(); }, false);
    document.getElementById("loginPlug").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.plug) }, false);
    document.getElementById("loginStoic").addEventListener('click', async function () { await CommonIdentityProvider.Login(WalletTypes.stoic) }, false);
    document.getElementById("logout").addEventListener('click', async function () { await CommonIdentityProvider.Logout() }, false);
  }, false)



