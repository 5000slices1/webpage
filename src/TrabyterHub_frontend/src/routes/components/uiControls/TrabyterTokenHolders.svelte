<script lang="ts" module>
    export interface TokenHoldersSettings {
        tokenCanisterId: string;
        tokenName: string;
        tokenSymbol: string;
        //tokenDecimals: number;
    }
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import {TokenHoldersItemModel, TokenHoldersService} from '$lib/javascript/Services/TokenHoldersService';

    let {
        settings = {
            tokenCanisterId: '',
            tokenName: '',
            tokenSymbol: '',
        } as TokenHoldersSettings,
    } = $props<{settings?: TokenHoldersSettings}>();

    let items: TokenHoldersItemModel[] = $state([]);
    let holdersCount: number = $state(0);
    let currentStartIndex: number = $state(0);
    let goToFirstPagePossible: boolean = $state(false);
    let goToLastPagePossible: boolean = $state(false);
    let pageShownMaxIndex: number = $state(0);
    let pageShownMinIndex: number = $state(0);
    let rowsPerPage: string = $state('10'); // Default value for rows per page

    let service: TokenHoldersService;

    onMount(async () => {
        console.log('TokenHolders onMount called');
        if (items === undefined || items === null || items.length === 0) {
            console.log('Initializing TokenHoldersService');
            service = new TokenHoldersService(settings.tokenCanisterId);
            await service.InitializeAsync();
            holdersCount = await service.GetHoldersCountAsync();
            items = await service.GetHoldersAsync(0, parseInt(rowsPerPage));
            console.log('TokenHoldersService initialized');
            console.log('Holders count:', holdersCount);
            console.log('Items:', items);
            await updateUi();
        }
    });

    async function UpdateNavigationInformationAsync() {
        if (items === undefined || items === null || items.length === 0) {
            goToFirstPagePossible = false;
            goToLastPagePossible = false;
            console.warn('No items available to update navigation information.');
            return;
        }
        console.log('Updating navigation information...');
        console.log('Current start index:', currentStartIndex);
        console.log('Holders count:', holdersCount);
        goToFirstPagePossible = currentStartIndex > 0;
        goToLastPagePossible = currentStartIndex + parseInt(rowsPerPage) < holdersCount;

        console.log('Go to first page possible:', goToFirstPagePossible);
        console.log('Go to last page possible:', goToLastPagePossible);
    }

    async function updateUi() {
        if (items === undefined || items === null || items.length === 0) {
            return;
        }

        //holdersCount = await service.GetHoldersCountAsync();
        items = [];
        items = await service.GetHoldersAsync(currentStartIndex, parseInt(rowsPerPage));
        pageShownMaxIndex = currentStartIndex + items.length - 1;
        pageShownMinIndex = currentStartIndex;
        await UpdateNavigationInformationAsync();
    }
    async function navigateToFirstPage() {
        currentStartIndex = 0;
        await updateUi();
    }
    async function navigateToLastPage() {
        currentStartIndex = Math.floor(holdersCount / parseInt(rowsPerPage)) * parseInt(rowsPerPage);
        await updateUi();
    }
    async function navigateToNextPage() {
        currentStartIndex += parseInt(rowsPerPage);
        if (currentStartIndex >= holdersCount) {
            currentStartIndex = Math.floor(holdersCount / parseInt(rowsPerPage)) * parseInt(rowsPerPage);
        }
        await updateUi();
    }
    async function navigateToPreviousPage() {
        currentStartIndex -= parseInt(rowsPerPage);
        if (currentStartIndex < 0) {
            currentStartIndex = 0;
        }
        await updateUi();
    }
    $effect(() => {
        if (items === undefined || items === null || items.length === 0) {
            return;
        }
        pageShownMaxIndex = currentStartIndex + items.length - 1;
        pageShownMinIndex = currentStartIndex;
    });
</script>

<div>
    <div class="token-explorer" style="background-color: rgba(84, 143, 232, 0.3);">
        <h2 style="color: white; font-weight:bold">
            Token Holders - {settings.tokenSymbol} ({settings.tokenName})
        </h2>

        <div style="margin-top: 0.0rem;margin-bottom:1.0rem; margin-left:0.0rem">
            <div style="display: flex; align-items: center; gap: 1rem;">
                <label for="rows" style="color: white;">Rows:</label>
                <select
                    id="rows"
                    onchange={async (e: Event) => {
                        const target = e.target as HTMLSelectElement;
                        if (!target || target.value === undefined || target.value === null) {
                            return;
                        }

                        rowsPerPage = target.value;
                        await updateUi();
                    }}
                    bind:value={rowsPerPage}
                    style="border-radius: 1px;height:1.5rem; width: 3.0rem; color: black;
                background-color: white; border: 1px solid rgba(84, 143, 232, 0.3);"
                >
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                    <option value="200">200</option>
                </select>
                <div style="width: 0.5rem;"></div>
                <p style="color: white;width: 1.5rem;">Nr.:</p>
                <p style="color: white; width: 4.0rem; text-align: right;">
                    {pageShownMinIndex}
                </p>
                <p style="color: white; width: 0.5rem; text-align: center;">-</p>
                <p style="color: white;width: 4.0rem;">{pageShownMaxIndex}</p>
                <div style="width: 2.5rem;"></div>

                <button
                    class="tokenexplorer-navigation-rewind-button"
                    style="
                background: url({goToFirstPagePossible
                        ? '/icons/navigation/left_rewind_highlight.png'
                        : '/icons/navigation/left_rewind.png'});
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                    aria-label="left rewind"
                    disabled={!goToFirstPagePossible}
                    onclick={async () => await navigateToFirstPage()}
                >
                </button>
                <button
                    class="tokenexplorer-navigation-button"
                    style="background: url({goToFirstPagePossible
                        ? '/icons/navigation/left_highlight.png'
                        : '/icons/navigation/left.png'});
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                    aria-label="left"
                    disabled={!goToFirstPagePossible}
                    onclick={async () => await navigateToPreviousPage()}
                >
                </button>
                <button
                    class="tokenexplorer-navigation-button"
                    style=" background: url({goToLastPagePossible
                        ? '/icons/navigation/right_highlight.png'
                        : '/icons/navigation/right.png'});
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                    aria-label="right"
                    disabled={!goToLastPagePossible}
                    onclick={async () => await navigateToNextPage()}
                >
                </button>
                <button
                    class="tokenexplorer-navigation-rewind-button"
                    style=" background: url({goToLastPagePossible
                        ? '/icons/navigation/right_forward_highlight.png'
                        : '/icons/navigation/right_forward.png'});
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                    aria-label="right forward"
                    disabled={!goToLastPagePossible}
                    onclick={async () => await navigateToLastPage()}
                >
                </button>
            </div>
        </div>

        <div class="token-list">
            {#each items as item, index}
                <div class="token-item" in:fade={{duration: 1000}}>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3rem;">Nr. {item.Index}</p>
                        <p style="width: 5rem;">{item.Amount}<br />{settings.tokenSymbol}</p>
                        <p style="max-width: 18rem;">{item.Principal}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
</div>

<style>
    .token-explorer {
        padding: 1rem;
        /* border: 1px solid #ccc; */
        border-radius: 8px;
        background-color: #f9f9f9;
        box-shadow: 0 0.1rem 0.2rem rgba(0, 0, 0, 0.1);
        margin: 0rem;
        border-radius: 1.2rem;
    }

    .token-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        font-size: 0.8rem;
    }

    .token-item {
        max-width: 33rem;
        padding: 0.5rem;
        border: 1px solid rgba(84, 143, 232, 0.3);
        border-radius: 8px;
        background-color: rgba(74, 133, 222, 0.6);
        box-shadow:
            0 0.2rem 0.5rem rgba(0, 0, 0, 0.2),
            0 0.1rem 0.3rem rgba(84, 143, 232, 0.4);
        transition:
            box-shadow 0.2s ease,
            transform 0.2s ease;
        color: rgba(250, 250, 250, 0.95);
        transform: translateZ(0);
    }

    .token-item p {
        margin: 0.2rem 0;
    }

    .tokenexplorer-navigation-rewind-button {
        width: 1.2rem;
        height: 1.5rem;
        margin: 0em;
        padding: 0em;
        border: 0px;
        background-color: transparent;
        color: white;
        cursor: pointer;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    .tokenexplorer-navigation-button {
        width: 1rem;
        height: 1.5rem;
        margin: 0em;
        padding: 0em;
        border: 0px;
        background-color: transparent;
        color: white;
        cursor: pointer;
        background-repeat: no-repeat;
        background-position: center;
        background-size: cover;
    }

    .tokenexplorer-navigation-rewind-button {
        composes: tokenexplorer-navigation-button;
        width: 1.2rem;
        height: 1.5rem;
    }
</style>
