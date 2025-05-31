<script lang="ts">
    //import adapter from '@sveltejs/adapter-static';
    import {browser, version} from '$app/environment';
    import {onMount} from 'svelte';
    import {MainClass} from '../lib/javascript/Logic/MainClass';
    import {ModelWalletTypes} from '$lib/javascript/Abstractions/Identity/ModelWalletTypes';
    import './../app.css';
    import {goto} from '$app/navigation';

    import SubNavigation from '$lib/../routes/components/navigation/subnavigation.svelte';
    import type {
        NavigationItem,
        NavigationSettings,
    } from '$lib/../routes/components/navigation/subnavigation.svelte';

    import IconTrabyter from '/icons/TraByterLogo.png';
    import Subnavigation from '$lib/../routes/components/navigation/subnavigation.svelte';
    const canisterId = process.env.CANISTER_ID_TRABYTERHUB_FRONTEND;
    let data = $props();

    let headerButtonsHorizontalSpacing: string = '0.8rem';
    let sunNavigationItems: NavigationItem[] = $state([]);
    let subNavigationSettings: NavigationSettings = $state({
        buttonHeightStyleValue: '3.0rem',
        navigationIsVisible: false,
    });

    let subNavigation: Subnavigation;

    if (browser) {
        console.log(window.innerWidth);
        console.log('Svelte version: ' + version);
        console.log('TrabyterHub Frontend canister ID: ' + canisterId);

        // Initialize the main navigation button styling
        MainNavButtonStylingUpdate('navButtonHome');
    }

    onMount(async () => {
        console.log('the component has mounted');
        if (browser) {
            if ($MainClass.IsInitDone()) {
                console.log('init already');
                return;
            }
            console.log('start init');
            await $MainClass.InitAsync();
            console.log('end init');
        }
        console.log('start done');
    });

    async function ShowSubNavigationNftsItems() {
        // first make it invisible
        subNavigationSettings.navigationIsVisible = false;

        // Adjust the height of the buttons
        subNavigationSettings.buttonHeightStyleValue = '3.0rem';

        // Now adjust the items
        sunNavigationItems = [
            {
                text: 'Overview',
                href: '/pages/tokensNft/overview',
                styleWidth: '8.0rem',
            },
            {
                text: 'Trabyter Bucks',
                href: '/pages/tokensNft/trabyterbucks',
                styleWidth: '8.0rem',
            },
            {
                text: 'Trabyter Premium',
                href: '/pages/tokensNft/trabyterpremium',
                styleWidth: '8.0rem',
            },
            {text: 'NFTS', href: '/pages/tokensNft/nfts', styleWidth: '8.0rem'},
        ];

        // first navigate to the default page
        await subNavigation.NavigateTo('/pages/tokensNft/overview');

        // Now make it visible
        subNavigationSettings.navigationIsVisible = true;
    }

    async function ShowSubNavigationNewsItems() {
        // first make it invisible
        subNavigationSettings.navigationIsVisible = false;

        // Adjust the height of the buttons
        subNavigationSettings.buttonHeightStyleValue = '3.0rem';

        // Now adjust the items
        sunNavigationItems = [
            {
                text: 'News on youtube',
                href: '/pages/news/youtubeNews',
                styleWidth: '12.0rem',
            },
            {
                text: 'News about development state',
                href: '/pages/news/developingStateNews',
                styleWidth: '12.0rem',
            },
        ];

        // first navigate to the default page
        await subNavigation.NavigateTo('/pages/news/youtubeNews');

        // Now make it visible
        subNavigationSettings.navigationIsVisible = true;
    }

    async function WalletLoginPlug() {
        if (browser) {
            await $MainClass.IdentityProvider.Login(ModelWalletTypes.plug);
        }
    }

    async function WalletLogout() {
        if (browser) {
            await $MainClass.IdentityProvider.Logout();
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
        // set other buttons to not selected
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

    async function navigateToHomePageClicked() {
        console.log('navigateToHomePage');
        subNavigationSettings.navigationIsVisible = false;
        MainNavButtonStylingUpdate('navButtonHome');
        await navigateToUrl('/');
    }

    async function navigateToAppsPageClicked() {
        subNavigationSettings.navigationIsVisible = false;
        MainNavButtonStylingUpdate('navButtonApps');
        let url = '/pages/apps';
        await navigateToUrl(url);
    }

    async function navigateToTokensNftPageClicked() {
        await ShowSubNavigationNftsItems();
        MainNavButtonStylingUpdate('navButtonNfts');
    }
    async function navigateToNewsPageClicked() {
        await await ShowSubNavigationNewsItems();
        MainNavButtonStylingUpdate('navButtonNews');
    }

    async function navigateToUrl(url: string) {
        await goto(url, {
            replaceState: true,
        });
        // This is a workaround to avoid the issue with the browser history
        window.history.replaceState(history.state, '', '/');
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
                                                        onclick={async () =>
                                                            await navigateToHomePageClicked()}
                                                        >Home</button
                                                    >
                                                </td>
                                                <td
                                                    style="width: {headerButtonsHorizontalSpacing}; min-width: {headerButtonsHorizontalSpacing};"
                                                ></td>
                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonApps"
                                                        onclick={async () =>
                                                            await navigateToAppsPageClicked()}
                                                        >Apps</button
                                                    >
                                                </td>

                                                <td
                                                    style="width: {headerButtonsHorizontalSpacing}; min-width: {headerButtonsHorizontalSpacing};"
                                                ></td>
                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonNfts"
                                                        onclick={async () =>
                                                            await navigateToTokensNftPageClicked()}
                                                        >Tokens / NFT</button
                                                    >
                                                </td>

                                                <td
                                                    style="width: {headerButtonsHorizontalSpacing}; min-width: {headerButtonsHorizontalSpacing};"
                                                >
                                                </td>

                                                <td>
                                                    <button
                                                        class="main-header-button"
                                                        id="navButtonNews"
                                                        onclick={async () =>
                                                            await navigateToNewsPageClicked()}
                                                        >News</button
                                                    >
                                                </td>
                                                <td
                                                    style="width: {headerButtonsHorizontalSpacing}; min-width: {headerButtonsHorizontalSpacing};"
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

                                <div style="color: white;">
                                    <SubNavigation
                                        bind:this={subNavigation}
                                        navigationItems={sunNavigationItems}
                                        navigationSettings={subNavigationSettings}
                                    />
                                </div>
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
                                                    aria-label="Facebook"
                                                    href="https://www.facebook.com/mysliceinfo"
                                                    ><i class="fa fa-facebook-f"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    aria-label="Twitter"
                                                    href="https://x.com/trabyter_apps"
                                                    ><i class="fa fa-twitter"
                                                    ></i></a
                                                >
                                            </li>
                                            <li>
                                                <a
                                                    target="_blank"
                                                    aria-label="YouTube"
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
                                                    aria-label="GitHub"
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
                                                    aria-label="Telegram"
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
                                                    aria-label="Instagram"
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
