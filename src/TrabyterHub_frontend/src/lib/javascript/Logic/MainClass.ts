import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';
import {
    TrabyterBucks_CanisterId,
    TrabyterPremium_CanisterId,
} from '$lib/javascript/Abstractions/constants/globalConstants.js';
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
        console.log('GlobalTypes.InitAsync done');
        await this.PrefetchSomeDataInBackgroundAsync();
    }

    IsInitDone() {
        return this.#init_done;
    }

    async PrefetchSomeDataInBackgroundAsync() {
        // This method can be used to prefetch some data in the background
        // For example, you can call some API or load some data that is needed later
        // This is just a placeholder for now
        console.log('Prefetching some data in background...');
        // Simulate a delay
        const prefetchData = async () => {
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
        };

        // Run the prefetchData function in the background
        prefetchData().catch((error) => {
            console.error('Error while prefetching data:', error);
        });

        console.log('Data prefetched.');
    }
}

// In Svelte, to make MainClass persistent for the whole session, you can use a Svelte store.
// Here's how you can export it as a writable store:

export const MainClass = writable(new InternalMainClass());
