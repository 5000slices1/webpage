import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';
import {
    TrabyterBucks_CanisterId,
    TrabyterPremium_CanisterId,
} from '$lib/javascript/Abstractions/constants/globalConstants.js';
import {
    TokenExplorerItem,
    TokenExplorerResponse,
    TokenExplorerService,
} from '$lib/javascript/Services/TokenExplorerService';
import {TokenInformationService} from '$lib/javascript/Services/TokenInformationService';
import {writable} from 'svelte/store';

import {IdentityProvider} from './identity/IdentityProvider';

import type {TokenInformationSettings} from '$lib/../routes/components/uiControls/tokeninformation.svelte';
class InternalMainClass {
    #init_done: boolean = false;
    IdentityProvider: IdentityProvider;
    counter: number = 0;
    constructor() {
        this.IdentityProvider = new IdentityProvider();
        this.counter = 0;
    }

    async InitAsync() {
        if (this.#init_done) {
            return;
        }
        await this.IdentityProvider.Init();
        this.#init_done = true;
        await this.PrefetchSomeDataInBackgroundAsync();
    }

    IsInitDone() {
        return this.#init_done;
    }

    async PrefetchSomeDataInBackgroundAsync() {
        // This method can be used to prefetch some data in the background
        // For example, you can call some API or load some data that is needed later
        // This is just a placeholder for now
        //console.log('Prefetching some data in background...');
        // Simulate a delay
        const prefetchData = async () => {
            if (typeof window === 'undefined' || !window.sessionStorage) {
                console.warn('Session storage is not available. Prefetching will not store data.');
                return;
            }

            await Promise.all([this.fetchDataTokenInfoAsync(), this.fetchDataTokenExplorerAsync()]);

            console.log(
                'Prefetching data done. TRA and TRAPRE token information and explorer data are stored in session storage.',
            );
        };

        // Run the prefetchData function in the background
        prefetchData().catch((error) => {
            console.error('Error while prefetching data:', error);
        });

        //console.log('Data prefetched.');
    }

    private async fetchDataTokenExplorerAsync() {
        const firstTraKey: string = 'ExplorerResponse_' + TrabyterBucks_CanisterId;
        const secondTraKey: string = 'ExplorerResponseLastTx_' + TrabyterBucks_CanisterId;

        const firstTrapreKey: string = 'ExplorerResponse_' + TrabyterPremium_CanisterId;
        const secondTrapreKey: string = 'ExplorerResponseLastTx_' + TrabyterPremium_CanisterId;
        sessionStorage.removeItem(firstTraKey); // Clear previous data
        sessionStorage.removeItem(secondTraKey); // Clear previous data
        sessionStorage.removeItem(firstTrapreKey); // Clear previous data
        sessionStorage.removeItem(secondTrapreKey); // Clear previous data

        var trabyterExplorerService = new TokenExplorerService(TrabyterBucks_CanisterId);
        var trabyterPremiumExplorerService = new TokenExplorerService(TrabyterPremium_CanisterId);

        await Promise.all([
            trabyterExplorerService.InitializeAsync(),
            trabyterPremiumExplorerService.InitializeAsync(),
        ]);

        let [traLastTx, traPremiumLastTx] = await Promise.all([
            trabyterExplorerService.TotalTxCountAsync(),
            trabyterPremiumExplorerService.TotalTxCountAsync(),
        ]);

        let numberTralastTx: number = Number(traLastTx) - Number(1);
        let numberTraPremiumLastTx: number = Number(traPremiumLastTx) - Number(1);

        const [traPremiumExplorerResponse, traExplorerResponse] = await Promise.all([
            trabyterPremiumExplorerService.GetTransactionsByStartTxIdAsync(numberTraPremiumLastTx - 4, 5),
            trabyterExplorerService.GetTransactionsByStartTxIdAsync(numberTralastTx - 4, 5),
        ]);

        if (traExplorerResponse != null && traExplorerResponse.hasError == false) {
            // Store into session storage
            try {
                const serializableResponse = JSON.stringify(traExplorerResponse);

                sessionStorage.setItem(firstTraKey, serializableResponse);
            } catch (error) {
                console.error('Failed to serialize traExplorerResponse:', error);
            }
            try {
                const numberTralastTxString = JSON.stringify(numberTralastTx);

                sessionStorage.setItem(secondTraKey, numberTralastTxString);
            } catch (error) {
                console.error('Failed to serialize numberTralastTx:', error);
            }
        }

        if (traPremiumExplorerResponse != null && traPremiumExplorerResponse.hasError == false) {
            // Store into session storage
            sessionStorage.setItem(firstTrapreKey, JSON.stringify(traPremiumExplorerResponse));
            sessionStorage.setItem(secondTrapreKey, JSON.stringify(numberTraPremiumLastTx));
        }
    }

    private async fetchDataTokenInfoAsync() {
        var traTokenService = new TokenInformationService();
        var traPremiumTokenService = new TokenInformationService();

        const traSettings: TokenInformationSettings = {
            baseCurrency: 'TRA',
            targetCurrency: 'ICP',
            tokenCanisterId: TrabyterBucks_CanisterId,
        };
        const traPremium: TokenInformationSettings = {
            baseCurrency: 'TRAPRE',
            targetCurrency: 'ICP',
            tokenCanisterId: TrabyterPremium_CanisterId,
        };

        await Promise.all([
            traTokenService.initTokenInformationAsync(traSettings),
            traPremiumTokenService.initTokenInformationAsync(traPremium),
        ]);
    }
}

// In Svelte, to make MainClass persistent for the whole session, you can use a Svelte store.
// Here's how you can export it as a writable store:

export const MainClass = writable(new InternalMainClass());
