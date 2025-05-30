<script lang="ts">
    //import adapter from '@sveltejs/adapter-static';
    import {browser} from '$app/environment';
    import {onMount} from 'svelte';
    import {MainClass} from '../lib/javascript/Logic/MainClass';
    import {ModelWalletTypes} from '$lib/javascript/Abstractions/Identity/ModelWalletTypes';
    import {version} from '$app/environment';
    import './../app.css';
    import {goto as navigateToUrl} from '$app/navigation';

    import SubNavigation from '$lib/../routes/components/navigation/subnavigation.svelte';
    import type {
        NavigationItem,
        NavigationSettings,
    } from '$lib/../routes/components/navigation/subnavigation.svelte';

    //import {page} from '$app/state';
    //import {Artemis} from './../artemis-web3-adapter/src/index.js';

    //export let data: any;
    import IconTrabyter from '/icons/TraByterLogo.png';
    //import Logo2 from '/logo2.svg';
    //import {Console} from 'console';

    const canisterId = process.env.CANISTER_ID_TRABYTERHUB_FRONTEND;
    let data = $props();
    let navItems: NavigationItem[] = [];
    let buttonHorizontalSpacing: string = '0.8rem';

    let navigationSettings: NavigationSettings = $state({
        buttonHeightStyleValue: '3.0rem',
        navigationIsVisible: false,
    });

    if (browser) {
        console.log(window.innerWidth);
        console.log('Svelte version: ' + version);
        console.log('TrabyterHub Frontend canister ID: ' + canisterId);

        // Define navigation items for this page
        navItems = [
            {text: 'Overview', href: '/home'},
            {text: 'Trabyter Bucks', href: '/TrabyterBucks'},
            {text: 'Trabyter Premium', href: '/TrabyterPremium'},
            {text: 'NFTS', href: '/nfts'},
        ];
        MainNavButtonStylingUpdate('navButtonHome');
    }

    onMount(async () => {
        console.log('the component has mounted');
        console.log('start init');
        if (browser) {
            if (MainClass.IsInitDone()) {
                return;
            }
            await MainClass.InitAsync();
        }
        console.log('start done');
    });

    async function WalletLoginPlug() {
        if (browser) {
            await MainClass.IdentityProvider.Login(ModelWalletTypes.plug);
        }
    }

    async function WalletLogout() {
        if (browser) {
            await MainClass.IdentityProvider.Logout();
        }
    }

    async function OnButtonWalletDropDownClicked() {
        console.log('OnButtonWalletDropDownClicked');
        if (browser) {
            const element = document.getElementById('dropDownWalletMenu');
            if (element) {
                element.classList.add('show');
            }
        }
    }
    // Close the dropdown menu if the user clicks outside of it
    if (browser) {
        window.onclick = function (event) {
            var targetElement = event?.target as HTMLElement;
            if (
                targetElement == null ||
                !targetElement.className.toString().match('walletLoginButton')
            ) {
                const element = document.getElementById('dropDownWalletMenu');
                if (element != null && element.classList.contains('show')) {
                    element.classList.remove('show');
                }
            }
        };
    }

    // Main navigation button clicked
    function MainNavButtonStylingUpdate(id: string) {
        //button.classList.add('main-header-button-selected');
        //var id = button.getAttribute('id');

        // set other buttons to not selected
        //var divMainMenu = document.getElementById("divMainMenu");
        var buttons = document.getElementsByClassName('main-header-button');
        for (var i = 0; i < buttons.length; i++) {
            var currentId = buttons[i].getAttribute('id');
            if (currentId != id) {
                buttons[i].classList.remove('main-header-button-selected');
            } else {
                buttons[i].classList.add('main-header-button-selected');
            }
        }
    }

    function navigateToHomePageClicked() {
        console.log('navigateToHomePage');
        navigationSettings.navigationIsVisible = false;
        MainNavButtonStylingUpdate('navButtonHome');
        navigateToUrl('/?canisterId=' + canisterId);
    }

    function navigateToAppsPageClicked() {
        navigationSettings.navigationIsVisible = false;
        MainNavButtonStylingUpdate('navButtonApps');
        navigateToUrl('/?canisterId=' + canisterId);
        //navigateToUrl('/pages/deposit?canisterId=' + canisterId);
    }

    function navigateToTokensNftPageClicked() {
        navigationSettings.navigationIsVisible = true;
        MainNavButtonStylingUpdate('navButtonNfts');
        navigateToUrl('/?canisterId=' + canisterId);
        //navigateToUrl('/pages/information?canisterId=' + canisterId);
    }
    function navigateToNewsPageClicked() {
        navigationSettings.navigationIsVisible = false;
        MainNavButtonStylingUpdate('navButtonNews');
        navigateToUrl('/?canisterId=' + canisterId);
        //navigateToUrl('/pages/stakingpool?canisterId=' + canisterId);
    }
</script>

<div class="main-html-content" style="margin: 0 0 0 0; padding: 0 0 0 0;">
    <main class="main-body-content">
        <link
            rel="stylesheet"
            href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
        />
        <div
            style="min-height: calc(100vh - 2.1em);
                   height:  calc(100vh - 2.1em);
    vertical-align: top;
    "
        >
            <table
                cellspacing="0"
                cellpadding="0"
                style="width: 100%;height:100%"
            >
                <tbody>
                    <tr>
                        <td style="height: 0.2rem;"> </td>
                    </tr>
                    <tr>
                        <td>
                            <!-- Header section -->
                            <header class="main-header">
                                <div
                                    class="main-header-div"
                                    id="divMainMenu"
                                    style="vertical-align: top;"
                                >
                                    <table
                                        cellspacing="0"
                                        cellpadding="0"
                                        class="main-header table"
                                        style="vertical-align: top;"
                                    >
                                        <tbody>
                                            <tr>
                                                <td
                                                    style="width: 0.0em; min-width: 0.0em;"
                                                >
                                                </td>

                                                <td>
                                                    <div
                                                        style="
                                            padding-top: 0.1em;
                                            margin-left: -1.0rem;
                                            padding-left: -1.0rem;
                                            opacity: 0.85;"
                                                    >
                                                        <img
                                                            src={IconTrabyter}
                                                            width="68rem"
                                                            height="64rem"
                                                            class="main-header-image"
                                                            alt=""
                                                        />
                                                    </div>
                                                </td>
                                                <td
                                                    style="width: 0.0em; min-width: 0.0em;"
                                                >
                                                </td>
                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonHome"
                                                        onclick={() =>
                                                            navigateToHomePageClicked()}
                                                        >Home</button
                                                    >
                                                </td>
                                                <td
                                                    style="width: {buttonHorizontalSpacing}; min-width: {buttonHorizontalSpacing};"
                                                ></td>
                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonApps"
                                                        onclick={() =>
                                                            navigateToAppsPageClicked()}
                                                        >Apps</button
                                                    >
                                                </td>

                                                <td
                                                    style="width: {buttonHorizontalSpacing}; min-width: {buttonHorizontalSpacing};"
                                                ></td>
                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonNfts"
                                                        onclick={() =>
                                                            navigateToTokensNftPageClicked()}
                                                        >Tokens / NFT</button
                                                    >
                                                </td>

                                                <td
                                                    style="width: {buttonHorizontalSpacing}; min-width: {buttonHorizontalSpacing};"
                                                >
                                                </td>

                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonNews"
                                                        onclick={() =>
                                                            navigateToNewsPageClicked()}
                                                        >News</button
                                                    >
                                                </td>
                                                <td
                                                    style="width: {buttonHorizontalSpacing}; min-width: {buttonHorizontalSpacing};"
                                                >
                                                </td>
                                                <td>
                                                    <!-- #region Wallet connection dropdown - hidden for now, because no usage at the moment -->
                                                    <div class="dropdown">
                                                        <button
                                                            id="buttonWalletDropDown"
                                                            type="submit"
                                                            class="walletLoginButton"
                                                            onclick={OnButtonWalletDropDownClicked}
                                                            >Wallet Connection</button
                                                        >

                                                        <div
                                                            id="dropDownWalletMenu"
                                                            class="wallet-control-not-logged-in"
                                                        >
                                                            <table
                                                                cellspacing="0"
                                                                cellpadding="0"
                                                            >
                                                                <tbody>
                                                                    <tr>
                                                                        <td>
                                                                            <button
                                                                                id="loginPlug"
                                                                                type="submit"
                                                                                class="button-dropdownmenu"
                                                                                onclick={WalletLoginPlug}
                                                                            >
                                                                                <img
                                                                                    src="/icons/plug.jpg"
                                                                                    alt="plug"
                                                                                    width="22em"
                                                                                    height="22em"
                                                                                    style="float: left;margin-left: 0.4em;"
                                                                                />
                                                                                <div
                                                                                    style="margin: auto;text-align: center;margin-top: 2px;"
                                                                                >
                                                                                    Connect
                                                                                    with
                                                                                    Plug
                                                                                </div>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            <button
                                                                                id="logout"
                                                                                type="submit"
                                                                                class="button-dropdownmenu"
                                                                                onclick={WalletLogout}
                                                                            >
                                                                                <div
                                                                                    style="margin: auto;text-align: right;margin-right: 10px;  margin-top: 0px;"
                                                                                >
                                                                                    Logout
                                                                                </div>
                                                                            </button>
                                                                        </td>
                                                                    </tr>
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                    <!-- #endregion Wallet connection dropdown -->
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <!-- submenu -->

                                <SubNavigation
                                    navigationItems={navItems}
                                    {navigationSettings}
                                />

                                <div></div>
                            </header>
                        </td>
                    </tr>

                    <tr style="height: 100%;vertical-align: top;">
                        <td>
                            <div
                                class="content-control-div"
                                id="divMainContent"
                                style="width: 100%; height: 100%; margin-top: 0.4em;"
                            >
                                <div
                                    class="inner-content-control-spacing"
                                    id="TraBucks_Inner_Content_Div"
                                    style="width: auto;"
                                >
                                    {@render data.children()}
                                </div>
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <footer
                                id="mainpage_footer"
                                class="footer"
                                style="
    font-size: 1.0em;width: calc(100% - 1em);
    height:4em;margin-top:1em;
    "
                            >
                                <div>
                                    Join Community: <a
                                        style="color:rgb(172, 101, 15);"
                                        target="_blank"
                                        href="https://oc.app/community/ovkev-xiaaa-aaaar-asorq-cai/channel/333479041001113364768524958478479859764/?ref=tzol4-lqaaa-aaaaf-aanaq-cai"
                                        >OpenChat</a
                                    >
                                    <div class="col-sm-5">
                                        <ul
                                            class="social_icon"
                                            style="margin-left:-3.4em;"
                                        >
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://www.trabyter.com"
                                                    >Trabyter.com</a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://www.facebook.com/mysliceinfo"
                                                    ><i class="fa fa-facebook-f"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://x.com/trabyter_apps"
                                                    ><i class="fa fa-twitter"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://www.youtube.com/channel/UCErWBRjdOWo_hmHNqb4yxDg"
                                                    ><i
                                                        class="fa fa-youtube-play"
                                                        aria-hidden="true"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://github.com/5000slices1?tab=repositories"
                                                    ><i
                                                        class="fa fa-github"
                                                        aria-hidden="true"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://t.me/mysliceinfo"
                                                    ><i
                                                        class="fa fa-telegram"
                                                        aria-hidden="true"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    href="https://www.instagram.com/5000slices"
                                                    ><i
                                                        class="fa fa-instagram"
                                                        aria-hidden="true"
                                                    ></i></a
                                                >
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </footer>
                        </td>
                    </tr>
                    <tr style="height: 0.2em;"> </tr>
                </tbody>
            </table>
        </div>
    </main>
</div>

<style>
</style>
