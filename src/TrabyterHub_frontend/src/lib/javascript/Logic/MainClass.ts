import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';
import {
    TrabyterBucks_CanisterId,
    TrabyterPremium_CanisterId,
} from '$lib/javascript/Abstractions/constants/globalConstants.js';
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
        await new Promise((resolve) => setTimeout(resolve, 1000));

        let trabyterSettings: TokenInformationSettings = {
            baseCurrency: 'TRA',
            targetCurrency: 'ICP',
            tokenCanisterId: TrabyterBucks_CanisterId,
        };

        //await tokenInfo.InitAsync();,
        console.log('Data prefetched.');
    }
}

// In Svelte, to make MainClass persistent for the whole session, you can use a Svelte store.
// Here's how you can export it as a writable store:

export const MainClass = writable(new InternalMainClass());
