<script lang="ts" module>
    export interface TokenExplorerSettings {
        tokenCanisterId: string;
        tokenName: string;
        tokenSymbol: string;
        tokenDecimals: number;
    }
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import {fade} from 'svelte/transition';
    import {TokenActor} from '$lib/javascript/Utils/TokenActor';
    import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';
    import {TokenExplorerSearchMode} from '$lib/javascript/Abstractions/explorer/searchMode';
    import {
        TokenExplorerResponse,
        TokenExplorerService,
        type TokenExplorerItem,
    } from '$lib/javascript/Services/TokenExplorerService';

    import {
        GetCustomDictionaryFromVariant,
        GetResultFromVariant,
        GetValueFromDictionary,
    } from '$lib/javascript/Utils/CommonUtils';

    // Props passed to the component, with default settings for token information.
    let {
        settings = {
            tokenCanisterId: '',
            tokenName: '',
            tokenSymbol: '',
            tokenDecimals: 8,
        } as TokenExplorerSettings,
    } = $props<{settings?: TokenExplorerSettings}>();

    let tokenExplorer: TokenExplorerService;

    let rowsPerPage: string = $state('5');
    let searchMode: TokenExplorerSearchMode = $state(
        TokenExplorerSearchMode.SearchByTxId,
    );

    let pageShownMaxTxId: number = $state(0);
    let pageShownMinTxId: number = $state(0);
    let searchTxValue: number = $state(-1);

    let totalLastTxIndex: number = $state(0);
    let goToFirstPagePossible: boolean = $state(false);
    let goToLastPagePossible: boolean = $state(false);

    // State variables to hold the token explorer items and response.
    var tokenExplorerItems: TokenExplorerItem[] = $state([]);
    var tokenExplorerResponse: TokenExplorerResponse | undefined =
        $state(undefined);

    onMount(async () => {
        // Fetch transactions from the token canister.
        try {
            if (tokenExplorer === undefined || tokenExplorer === null) {
                tokenExplorer = new TokenExplorerService(
                    settings.tokenCanisterId,
                );
                await tokenExplorer.InitializeAsync();

                let dataFromSessionStorageWasUsed: boolean = false;

                if (typeof window !== 'undefined') {
                    var keyExplorerResponse =
                        'ExplorerResponse_' + settings.tokenCanisterId;
                    var keyExplorerLastTxIndex =
                        'ExplorerResponseLastTx_' + settings.tokenCanisterId;

                    const cachedResponse =
                        sessionStorage.getItem(keyExplorerResponse);
                    const secondCachedResponse = sessionStorage.getItem(
                        keyExplorerLastTxIndex,
                    );

                    if (cachedResponse && secondCachedResponse) {
                        tokenExplorerResponse = JSON.parse(
                            cachedResponse,
                        ) as TokenExplorerResponse;
                        searchTxValue = Number(secondCachedResponse) as number;
                        dataFromSessionStorageWasUsed = true;
                        await updateUi();
                    }
                }
                if (dataFromSessionStorageWasUsed) {
                    // There might be already new transactions available,
                    // Therefore these additional lines of code here.
                    var totalCountTx = await tokenExplorer.TotalTxCountAsync();
                    totalLastTxIndex = Math.max(Number(totalCountTx) - 1, 0);
                    await UpdateNavigationInformation();
                } else {
                    await updateUi();
                }
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    });

    async function UpdateCurrentLastTxIndex() {
        if (tokenExplorerResponse === undefined) {
            console.warn('Token Explorer response is undefined.');
            return;
        }

        if (
            tokenExplorerResponse.items === undefined ||
            tokenExplorerResponse.items.length === 0
        ) {
            console.warn('Token Explorer items are empty.');
            return;
        }
    }

    async function navigateToFirstPage(): Promise<void> {
        if (goToFirstPagePossible) {
            if (searchMode === TokenExplorerSearchMode.SearchByTxId) {
                searchTxValue = totalLastTxIndex;
            } else if (
                searchMode === TokenExplorerSearchMode.SearchByPrincipal
            ) {
                // Handle navigation for SearchByPrincipal mode if needed.
            } else {
                console.warn('Unknown search mode:', searchMode);
            }
            await updateUi();
        }
    }

    async function navigateToPreviousPage() {
        if (goToFirstPagePossible) {
            if (searchMode === TokenExplorerSearchMode.SearchByTxId) {
                searchTxValue = pageShownMaxTxId + Number(rowsPerPage);
                if (searchTxValue > totalLastTxIndex) {
                    searchTxValue = totalLastTxIndex;
                }
            } else if (
                searchMode === TokenExplorerSearchMode.SearchByPrincipal
            ) {
                // Handle navigation for SearchByPrincipal mode if needed.
            } else {
                console.warn('Unknown search mode:', searchMode);
            }
            await updateUi();
        }
    }

    async function navigateToNextPage() {
        if (goToLastPagePossible) {
            if (searchMode === TokenExplorerSearchMode.SearchByTxId) {
                searchTxValue = pageShownMinTxId - 1;
                if (searchTxValue < 0) {
                    searchTxValue = 0;
                }
            } else if (
                searchMode === TokenExplorerSearchMode.SearchByPrincipal
            ) {
                // Handle navigation for SearchByPrincipal mode if needed.
            } else {
                console.warn('Unknown search mode:', searchMode);
            }
            await updateUi();
        }
    }

    async function navigateToLastPage() {
        if (goToLastPagePossible) {
            if (searchMode === TokenExplorerSearchMode.SearchByTxId) {
                searchTxValue = 0;
            } else if (
                searchMode === TokenExplorerSearchMode.SearchByPrincipal
            ) {
                // Handle navigation for SearchByPrincipal mode if needed.
            } else {
                console.warn('Unknown search mode:', searchMode);
            }
            await updateUi();
        }
    }

    async function UpdateNavigationInformation() {
        if (
            tokenExplorerResponse === undefined ||
            tokenExplorerResponse.items === undefined ||
            tokenExplorerItems === undefined ||
            tokenExplorerItems === null ||
            tokenExplorerItems.length === 0
        ) {
            goToFirstPagePossible = false;
            goToLastPagePossible = false;
            return;
        }

        // In searchmode 'searchByTxId' the 'tokenExplorerResponse.items' array has same count as 'tokenExplorerItems'.
        if (searchMode === TokenExplorerSearchMode.SearchByTxId) {
            // Calculate the min and max txid shown on the current page.
            // The first item in the array has the highest txIndex (most recent).
            pageShownMaxTxId = tokenExplorerItems[0].txIndex;
            pageShownMinTxId =
                tokenExplorerItems[tokenExplorerItems.length - 1].txIndex;

            // Determine if navigation buttons should be enabled.
            goToFirstPagePossible = pageShownMaxTxId < totalLastTxIndex;
            goToLastPagePossible = pageShownMinTxId > 0;
        } else if (searchMode == TokenExplorerSearchMode.SearchByPrincipal) {
            // In searchmode 'searchByPrincipal' the 'tokenExplorerResponse.items' array can
            // have higher count as 'tokenExplorerItems'.

            // Calculate the min and max txid from tokenExplorerResponse.items
            let cachedMaxTxId: number = tokenExplorerResponse.items[0].txIndex;
            let cachedMinTxId: number =
                tokenExplorerResponse.items[
                    tokenExplorerResponse.items.length - 1
                ].txIndex;

            goToFirstPagePossible = pageShownMaxTxId < cachedMaxTxId;
            goToLastPagePossible = cachedMinTxId > cachedMinTxId;
        } else {
            console.warn('Unknown search mode:', searchMode);
        }
    }

    async function updateUi(fetchRequired: boolean = false) {
        // Clear the current items before fetching new ones.
        tokenExplorerItems = [];

        if (
            tokenExplorerResponse === undefined ||
            tokenExplorerResponse.items === undefined ||
            fetchRequired
        ) {
            await fetchTransactions();
        }

        if (
            tokenExplorerResponse === undefined ||
            tokenExplorerResponse.items === undefined
        ) {
            console.warn('Token Explorer items are undefined.');
        } else {
            if (searchMode == TokenExplorerSearchMode.SearchByTxId) {
                var cachedMaxTxId: number =
                    tokenExplorerResponse.items[0].txIndex;

                if (searchTxValue != cachedMaxTxId) {
                    await fetchTransactions();
                }

                tokenExplorerItems = tokenExplorerResponse?.items;
            } else if (
                searchMode == TokenExplorerSearchMode.SearchByPrincipal
            ) {
            } else {
                console.warn('Unknown search mode:', searchMode);
            }
        }
        await UpdateNavigationInformation();
    }

    // Function to fetch transactions and update the state.
    async function fetchTransactions() {
        try {
            if (tokenExplorer === undefined || tokenExplorer === null) {
                tokenExplorer = new TokenExplorerService(
                    settings.tokenCanisterId,
                );
                await tokenExplorer.InitializeAsync();
            }

            if (searchMode == TokenExplorerSearchMode.SearchByTxId) {
                var totalCountTx = await tokenExplorer.TotalTxCountAsync();
                totalLastTxIndex = Math.max(Number(totalCountTx) - 1, 0);

                var maxItemsPerPage = Number(rowsPerPage);

                if (searchTxValue == -1) {
                    searchTxValue = totalLastTxIndex;
                }

                let searchValueToUse: number = Math.max(
                    searchTxValue - maxItemsPerPage + 1,
                    0,
                );

                const response =
                    await tokenExplorer.GetTransactionsByStartTxIdAsync(
                        searchValueToUse,
                        maxItemsPerPage,
                    );

                if (response === undefined || response?.hasError == true) {
                    console.error(
                        'Error fetching transactions:',
                        response?.errorMessage,
                    );
                    return;
                }

                tokenExplorerResponse = response;
            }
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }
</script>

<div>
    <div
        class="token-explorer"
        style="background-color: rgba(84, 143, 232, 0.3);"
    >
        <h2 style="color: white; font-weight:bold">
            Token Explorer - {settings.tokenSymbol} ({settings.tokenName})
        </h2>

        <div
            style="margin-top: 0.0rem;margin-bottom:1.0rem; margin-left:0.0rem"
        >
            <div style="display: flex; align-items: center; gap: 1rem;">
                <label for="rows" style="color: white;">Rows:</label>
                <select
                    id="rows"
                    onchange={async (e: Event) => {
                        const target = e.target as HTMLSelectElement;
                        if (
                            !target ||
                            target.value === undefined ||
                            target.value === null
                        ) {
                            return;
                        }

                        rowsPerPage = target.value;
                        await updateUi(true);
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
                <p style="color: white;width: 1.5rem;">Txid:</p>
                <p style="color: white; width: 4.0rem; text-align: right;">
                    {pageShownMaxTxId}
                </p>
                <p style="color: white; width: 0.5rem; text-align: center;">
                    -
                </p>
                <p style="color: white;width: 4.0rem;">{pageShownMinTxId}</p>
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
            {#each tokenExplorerItems as items, index}
                <div
                    class="token-item"
                    in:fade={{duration: 300}}
                    out:fade={{duration: 300}}
                >
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">Txid:</p>
                        <p style="width: 4rem;">{items.txIndex}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">Date:</p>
                        <p>
                            {items.DateTimeString}
                        </p>
                    </div>
                    <div style="height: 0.5rem;"></div>

                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">
                            {items.TransactionType.charAt(0).toUpperCase() +
                                items.TransactionType.slice(1).toLowerCase()}:
                        </p>
                        <p>{items.Amount} {settings.tokenSymbol}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">From:</p>
                        <p>{items.From}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">To:</p>
                        <p>{items.To}</p>
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

    .token-item h3 {
        margin: 0;
        font-size: 1.2rem;
    }

    .token-item p {
        margin: 0.2rem 0;
    }

    .token-item button {
        margin-top: 0.5rem;
        padding: 0.5rem;
        border: none;
        border-radius: 4px;
        background-color: #007bff;
        color: #fff;
        cursor: pointer;
    }

    .token-item button:hover {
        background-color: #0056b3;
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
