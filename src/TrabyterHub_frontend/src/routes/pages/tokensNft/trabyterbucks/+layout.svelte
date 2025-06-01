<script lang="ts">
    import Verticalnavigation from '$lib/../routes/components/navigation/verticalnavigation.svelte';
    import type {
        VerticalNavigationItem,
        VerticalNavigationSettings,
    } from '$lib/../routes/components/navigation/verticalnavigation.svelte';
    let data = $props();

    let verticalNavigationItems: VerticalNavigationItem[] = [
        {
            text: 'Info',
            href: '/pages/tokensNft/trabyterbucks/info',
            buttonHeightStyleValue: '3.0rem',
        },
        {
            text: 'Explorer',
            href: '/pages/tokensNft/trabyterbucks/explorer',
            buttonHeightStyleValue: '3.0rem',
        },
        {
            text: 'Holders',
            href: '/pages/tokensNft/trabyterbucks/holders',
            buttonHeightStyleValue: '3.0rem',
        },
    ];
    let verticalNavigationSettings: VerticalNavigationSettings = {
        buttonVerticalDistanceStyleHeight: '2.0rem',
        buttonWidthStyleValue: '5.0rem',
        buttonTextStyleFontSize: '0.8rem',
        navigationWidthStyleValue: '6.5rem',
        navigationIsVisible: true,
    };
    let verticalNavigation: Verticalnavigation;
</script>

<header>This is my Trabyter Bucks header</header>
<div style="height: 100%;width: 100%;min-height: 100%;">
    <table
        cellspacing="0"
        cellpadding="0"
        style="height: 100%;width: 100%;min-height: 100%;"
    >
        <tbody>
            <tr>
                <td>
                    <!-- Vertical Navigation -->
                    <Verticalnavigation
                        bind:this={verticalNavigation}
                        navigationItems={verticalNavigationItems}
                        navigationSettings={verticalNavigationSettings}
                    />
                </td>
                <td style="width:1.0rem;min-width:1.0rem"><div></div></td>
                <td style="width: 100%;height: 100%;">
                    <div
                        class="content-control-div"
                        style="height: 100%;width:100%; "
                    >
                        <div
                            class="inner-content-control-spacing"
                            style="width: auto;"
                        >
                            <!-- Main Content -->
                            {@render data.children()}
                        </div>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>
</div>

<style>
</style>
