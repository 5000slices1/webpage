import {writable} from 'svelte/store';

import {IdentityProvider} from './identity/IdentityProvider';

class InternalMainClass {
    #init_done: boolean = false;
    IdentityProvider: IdentityProvider;

    constructor() {
        this.IdentityProvider = new IdentityProvider();
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
}

// In Svelte, to make MainClass persistent for the whole session, you can use a Svelte store.
// Here's how you can export it as a writable store:

export const MainClass = writable(new InternalMainClass());
