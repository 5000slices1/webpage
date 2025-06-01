<script lang="ts" module>
    // Define the type for navigation items
    export interface VerticalNavigationItem {
        text: string;
        href: string;
        buttonHeightStyleValue: string;
    }
    export interface VerticalNavigationSettings {
        navigationIsVisible: boolean;
        buttonVerticalDistanceStyleHeight: string;
        buttonWidthStyleValue: string;
        buttonTextStyleFontSize: string;
        navigationWidthStyleValue: string;
    }
</script>

<script lang="ts">
    import {get} from 'svelte/store';
    import {goto} from '$app/navigation';

    let selectedHref = $state<string>('');

    // Props to accept navigation items from parent components
    const {
        navigationItems = [],
        navigationSettings = {
            buttonVerticalDistanceStyleHeight: '2.0rem',
            buttonWidthStyleValue: '7.0rem',
            buttonTextStyleFontSize: '1.2em',
            navigationWidthStyleValue: '10.3em',
            navigationIsVisible: true,
        },
    } = $props<{
        navigationItems?: VerticalNavigationItem[];
        navigationSettings?: VerticalNavigationSettings;
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

<div
    class="content-control-left-navigation"
    style="width: {navigationSettings.navigationWidthStyleValue};
                height: 100%;"
>
    <table cellspacing="0" cellpadding="0" style="width: 100%;">
        <tbody>
            {#each navigationItems as item, i (item.href)}
                <tr>
                    <td
                        style="height: {navigationSettings.buttonVerticalDistanceStyleHeight};"
                    >
                    </td>
                </tr>
                <tr>
                    <td align="center">
                        <button
                            class="content-control-left-navigation-button"
                            type="submit"
                            id={item.href}
                            aria-label={item.text}
                            class:content-control-left-navigation-button-active={selectedHref ===
                                item.href}
                            style="height: {item.buttonHeightStyleValue};
                                width: {navigationSettings.buttonWidthStyleValue};
                                font-size: {navigationSettings.buttonTextStyleFontSize};
                                "
                            onclick={() => NavigateTo(item.href)}
                        >
                            {item.text}
                        </button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>

<style>
    .content-control-left-navigation {
        width: 100%;
        border-radius: 0.6rem;

        background-color: rgba(85, 85, 123, 0.2);
        /* background-color: yellow; */

        box-shadow:
            0 0.1rem 0.2rem rgba(255, 254, 254, 0.25),
            inset 0.1rem 0.15rem 0.2rem rgba(255, 251, 251, 0.25),
            0.2rem 0em 0.3rem rgba(255, 254, 254, 0.25),
            inset 0.2rem -0.15rem 0.3rem rgba(255, 251, 251, 0.25);
    }

    .content-control-left-navigation {
        background-color: rgba(85, 85, 123, 0.9);
    }

    .content-control-left-navigation-button {
        /* width: 7rem;
        height: 4.25rem; */
        border-radius: 0.6rem;
        border-color: transparent;

        background-color: rgba(84, 143, 232, 0.3);
        color: rgba(228, 235, 255, 1);
        /* font-size: 1.2rem; */
        font-weight: bold;
        cursor: pointer;

        box-shadow:
            -0.02rem 0.02rem 0.2rem 0.2rem rgba(0, 0, 0, 0.25),
            0.02rem -0.02rem 0.2rem 0.04rem rgba(0, 0, 0, 0.25);

        /* transition-duration: 0.1s; */
    }

    .content-control-left-navigation-button:hover {
        color: rgba(255, 255, 255, 1);
        background-color: rgba(84, 143, 232, 0.6);

        box-shadow:
            -0.02rem 0.02rem 0.2rem 0.2rem rgba(0, 0, 0, 0.5),
            0.02rem -0.02rem 0.2rem 0.04rem rgba(0, 0, 0, 0.5);
    }

    .content-control-left-navigation-button-active {
        color: rgba(255, 255, 255, 1);
        background-color: rgba(84, 143, 232, 0.7);

        box-shadow:
            -0.03rem 0.03rem 0.3rem 0.3rem rgba(0, 0, 0, 0.5),
            0.03rem -0.03rem 0.3rem 0.05rem rgba(0, 0, 0, 0.6);
    }

    .content-control-div-header-text {
        font-size: 2.5rem;
        font-weight: bold;
        color: rgba(228, 235, 255, 1);
        font-family: 'Montserrat', sans-serif;
        text-align: left;
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
        letter-spacing: 0.072rem;
        -webkit-text-stroke: 0.057rem #060606;
        paint-order: stroke fill;
    }
</style>
