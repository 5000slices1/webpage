<script lang="ts" context="module">
    // Define the type for navigation items
    export interface NavigationItem {
        text: string;
        href: string;
        styleWidth?: string; // Optional width property
    }
    export interface NavigationSettings {
        buttonHeightStyleValue: string;
        navigationIsVisible: boolean;
    }
</script>

<script lang="ts">
    import {get} from 'svelte/store';
    import {goto} from '$app/navigation';

    //   // Define the type for navigation items
    //   export interface NavigationItem {
    //     text: string;
    //     href: string;
    //   }
    const canisterId = process.env.CANISTER_ID_TRABYTERHUB_FRONTEND;

    let selectedHref = $state<string>('');
    // Props to accept navigation items from parent components
    const {
        navigationItems = [],
        navigationSettings = {
            buttonHeightStyleValue: '3.0rem',
            navigationIsVisible: true,
        },
    } = $props<{
        navigationItems?: NavigationItem[];
        navigationSettings?: NavigationSettings;
    }>();

    export async function NavigateTo(url: string) {
        selectedHref = url;
        await goto(url, {
            replaceState: true,
        });
        // This is a workaround to avoid the issue with the browser history
        window.history.replaceState(history.state, '', '/');
    }
</script>

<!-- Render the navigation items as links -->

<div
    style="display: {navigationSettings.navigationIsVisible
        ? 'block'
        : 'none'};"
>
    <table cellspacing="0" cellpadding="0" width="auto">
        <tbody>
            <tr>
                {#each navigationItems as item, i (item.href)}
                    <td>
                        <div
                            class="sub-navigation-div"
                            style="border-bottom-left-radius: {i === 0
                                ? '1.0rem'
                                : '0rem'};
                                    border-bottom-right-radius: {i ===
                            navigationItems.length - 1
                                ? '1.0rem'
                                : '0rem'};
                                "
                        >
                            <button
                                class="sub-navigation-button {selectedHref ===
                                item.href
                                    ? 'sub-navigation-button-selected'
                                    : ''}"
                                type="button"
                                style:height={navigationSettings.buttonHeightStyleValue}
                                id={item.href}
                                style:width={item.styleWidth
                                    ? item.styleWidth
                                    : 'auto'}
                                onclick={async () => {
                                    await NavigateTo(item.href);
                                }}
                            >
                                {item.text}<br />
                            </button>
                        </div>
                    </td>
                    <td style="width: 0.4rem; min-width: 0.4rem;">
                        <div></div>
                    </td>
                {/each}
            </tr>
        </tbody>
    </table>
</div>

<style>
    /* Sub navigation */

    .sub-navigation-div {
        /* display: none; */
        display: block;

        margin-top: 0.65rem;
        border-top-left-radius: 0em;
        border-top-right-radius: 0em;
        box-shadow:
            0 0.2rem 0.2rem rgba(255, 254, 254, 0.25),
            inset 0.1rem 0.2rem 0.3rem rgba(255, 251, 251, 0.25);
        background-color: #55557b;
        color: white;
    }

    .sub-navigation-button {
        width: 100%;
        background-color: transparent;
        border: transparent;
        font-size: 0.9rem;
        font-weight: bold;
        cursor: pointer;
        text-align: center;
        font-family: 'Montserrat', sans-serif;

        color: rgba(84, 143, 232, 1);
        /* height: 3.0em; */
        height: auto;

        display: inline-block;
        position: relative;
        letter-spacing: 0.072rem;
        -webkit-text-stroke: 0.057rem #060606;
        paint-order: stroke fill;
    }
    .sub-navigation-button:hover {
        color: rgba(255, 255, 255, 0.8);
        transition-duration: 0.5s;
    }

    .sub-navigation-button-vertical-line {
        width: 0.4rem;
        margin-left: 0.8rem;
        background-color: #0e0f2c;
        height: 5rem;
    }

    .sub-navigation-button-horizontal-line {
        width: 8.4rem;
        margin-left: 0.9rem;
        background-color: transparent;
        height: 0.3rem;
        display: block;
    }

    .sub-navigation-button-horizontal-line-selected {
        display: block;
        background-color: rgba(255, 255, 255, 0.8);
        transition-duration: 0.5s;
    }

    .sub-navigation-button-selected {
        color: rgba(255, 255, 255, 0.8);
        transition-duration: 0.5s;
    }

    .sub-navigation-table {
        width: 50rem;
        padding-top: -2rem;
        padding-left: 0rem;
    }

    /* #endregion Sub navigation */
</style>
