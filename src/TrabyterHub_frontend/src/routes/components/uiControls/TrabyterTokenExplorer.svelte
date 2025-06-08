<script lang="ts" context="module">
    export interface TokenExplorerSettings {
        tokenCanisterId: string;
        tokenName: string;
        tokenSymbol: string;
        tokenDecimals: number;
    }

    export interface TokenTransferedInforamtion {
        from: string;
        to: string;
        amount: number;
        timestamp: Date;
        txid: string;
    }
</script>

<script lang="ts">
    import {onMount} from 'svelte';
    import {TokenActor} from '$lib/javascript/Utils/TokenActor';
    import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';

    import {
        GetCustomDictionaryFromVariant,
        GetResultFromVariant,
        GetValueFromDictionary,
    } from '$lib/javascript/Utils/CommonUtils';

    let rowsPerPage = 10;
    let currentIndex = 0;

    // Props passed to the component, with default settings for token information.
    let {
        settings = {
            tokenCanisterId: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            tokenName: 'Trabyter Token',
            tokenSymbol: 'TRBY',
            tokenDecimals: 8,
        } as TokenExplorerSettings,
    } = $props<{settings?: TokenExplorerSettings}>();

    var testArr: TokenTransferedInforamtion[] = [
        {
            from: 'r7inp-6aaaa-aaaaa-aaabq-cai',
            to: 'cwlbj-ovgqo-5bvt2-77eld-wenkb-gyyh5-gjrcx-i5hvc-k4w5c-xcheb-nqe',
            amount: 100.0,
            timestamp: new Date(),
            txid: '890',
        },
        {
            from: 'cwlbj-ovgqo-5bvt2-77eld-wenkb-gyyh5-gjrcx-i5hvc-k4w5c-xcheb-nqe',
            to: 'r7inp-6aaaa-aaaaa-aaabq-cai',
            amount: 50.0,
            timestamp: new Date(),
            txid: '321',
        },
        {
            from: 'r7inp-6aaaa-aaaaa-aaabq-cai',
            to: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            amount: 200.0,
            timestamp: new Date(),
            txid: '2334455',
        },
        {
            from: 'cwlbj-ovgqo-5bvt2-77eld-wenkb-gyyh5-gjrcx-i5hvc-k4w5c-xcheb-nqe',
            to: 'cwlbj-ovgqo-5bvt2-77eld-wenkb-gyyh5-gjrcx-i5hvc-k4w5c-xcheb-nqe',
            amount: 75.0,
            timestamp: new Date(),
            txid: '9',
        },
        {
            from: 'r7inp-6aaaa-aaaaa-aaabq-cai',
            to: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            amount: 300.003,
            timestamp: new Date(),
            txid: '234567890',
        },
        {
            from: 'ryjl3-tyaaa-aaaaa-aaaba-cai',
            to: 'r7inp-6aaaa-aaaaa-aaabq-cai',
            amount: 150.0,
            timestamp: new Date(),
            txid: '87654321',
        },
    ];
</script>

<div>
    <div
        class="token-explorer"
        style="background-color: rgba(84, 143, 232, 0.3);"
    >
        <h2 style="color: white; font-weight:bold">
            Token Explorer - {settings.tokenSymbol} ({settings.tokenName})
        </h2>
        <div class="token-list">
            {#each testArr as items, index}
                <div class="token-item">
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">Txid:</p>
                        <p style="width: 4rem;">{items.txid}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">Date:</p>
                        <p>
                            {items.timestamp.toLocaleString('en-US', {
                                month: '2-digit',
                                day: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                hour12: true,
                            })}
                        </p>
                    </div>
                    <div style="height: 0.5rem;"></div>

                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">Transfer:</p>
                        <p>{items.amount} {settings.tokenSymbol}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">From:</p>
                        <p>{items.from}</p>
                    </div>
                    <div style="display: flex; gap: 1rem;">
                        <p style="width: 3.5rem;">To:</p>
                        <p>{items.to}</p>
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <div style="margin-top: 1rem;margin-left:2.0rem">
        <div style="display: flex; align-items: center; gap: 1rem;">
            <label for="rows" style="color: white;">Rows:</label>
            <select
                id="rows"
                bind:value={rowsPerPage}
                style="border-radius: 1px;height:1.5rem; width: 3.0rem; color: black;
                background-color: white; border: 1px solid rgba(84, 143, 232, 0.3);"
            >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
            </select>
            <div style="width: 0.5rem;"></div>
            <p style="color: white;width: 1.5rem;">Txid:</p>
            <p style="color: white; width: 4.0rem; text-align: right;">
                27777777
            </p>
            <p style="color: white; width: 0.5rem; text-align: center;">-</p>
            <p style="color: white;width: 4.0rem;">7555555</p>
            <div style="width: 2.5rem;"></div>

            <button
                class="tokenexplorer-navigation-rewind-button"
                style="
                background: url('/icons/navigation/left_rewind.png');
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                aria-label="left rewind"
            >
            </button>
            <button
                class="tokenexplorer-navigation-button"
                style="background: url('/icons/navigation/left.png');
                background-repeat: no-repeat; background-position: center; background-size: cover;"
                aria-label="left"
            >
            </button>
            <button
                class="tokenexplorer-navigation-button"
                style="background: url('/icons/navigation/right.png'); background-repeat: no-repeat; background-position: center; background-size: cover;"
                aria-label="right"
            >
            </button>
            <button
                class="tokenexplorer-navigation-rewind-button"
                style="background: url('/icons/navigation/right_forward.png'); background-repeat: no-repeat; background-position: center; background-size: cover;"
                aria-label="right forward"
            >
            </button>
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
        margin: 1rem;
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
