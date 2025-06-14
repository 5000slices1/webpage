import {TokenActor} from '$lib/javascript/Utils/TokenActor';
import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';

import {Principal} from '@dfinity/principal';

export class TokenHoldersItemModel {
    Index: number = 0;
    Amount: number = 0.0;
    Principal: string = '';
}

export class TokenHoldersService {
    #actor: any;
    #canisterId: string;
    #decimals = 8; // Decimals used for our TRA tokens
    #allHoldersInformation: TokenHoldersItemModel[] | undefined = undefined;
    #holdersCount: number = 0;

    constructor(canisterId: string) {
        this.#canisterId = canisterId;
        this.#actor = null;
    }

    /**
     * Initializes the TokenHoldersService by creating an actor for the specified canister ID.
     * This method should be called before any other methods to ensure the actor is ready.
     */
    async InitializeAsync() {
        try {
            let tokenActor = new TokenActor();
            this.#actor = await tokenActor.GetActor(this.#canisterId);
        } catch (error) {
            console.error('Error initializing actor:', error);
        }
    }

    /**
     * Prefetches the token holders information and stores it in session storage.
     * This method is useful for caching data to improve performance on subsequent requests.
     */
    async PrefetchDataIntoSessionStorageAsync(): Promise<void> {
        if (this.#actor == null) {
            console.error('Actor is not initialized.');
            return undefined;
        }
        try {
            // Fetch the token holders information and store it in session storage
            let holders = await this.#InternalGetHoldersAsync();
            if (holders) {
                let key = `tokenHolders-${this.#canisterId}`;
                // Store the holders in session storage with a unique key
                sessionStorage.removeItem(key); // Clear previous data
                sessionStorage.setItem(key, JSON.stringify(holders));
                console.log('Token holders information prefetched and stored in session storage.');
            } else {
                console.warn('No token holders information available to prefetch.');
            }
        } catch (error) {
            console.error('Error prefetching token holders data:', error);
            return undefined;
        }
    }

    /**
     * Returns the count of token holders.
     * If the information is not yet fetched, it will fetch it first.
     */
    async GetHoldersCountAsync(): Promise<number> {
        if (this.#allHoldersInformation == undefined) {
            await this.#InternalUpdateTokenHoldersInformationAsync();
        }
        return this.#holdersCount;
    }

    async GetHoldersAsync(start: number, length: number): Promise<TokenHoldersItemModel[]> {
        if (this.#allHoldersInformation == undefined) {
            await this.#InternalUpdateTokenHoldersInformationAsync();
        }

        if (this.#allHoldersInformation == undefined) {
            console.error('Token holders information is not available.');
            return [];
        }

        if (start < 0 || length <= 0) {
            console.error('Invalid start or length parameters.');
            return [];
        }
        let maxIndex = start + length;
        if (maxIndex > this.#holdersCount) {
            maxIndex = this.#holdersCount;
        }
        if (start >= this.#holdersCount) {
            return [];
        }

        let holders: TokenHoldersItemModel[] = new Array<TokenHoldersItemModel>(maxIndex - start);

        var currentIndex = 0;
        for (let i = start; i < maxIndex; i++) {
            holders[currentIndex] = this.#allHoldersInformation[i] as TokenHoldersItemModel;
            currentIndex++;
        }
        return holders;
    }

    /**
     * Internal method to update the token holders information.
     * This method fetches the data from the blockchain and updates the internal state.
     */
    async #InternalUpdateTokenHoldersInformationAsync(): Promise<void> {
        if (this.#actor == null) {
            console.error('Actor is not initialized.');
            return undefined;
        }

        try {
            // Even holders with zero balance are included
            let allHoldersCount = await this.#actor.get_holders_count();
            let holders = new Array(allHoldersCount);

            let step = 500;
            let currentIndex = 0;
            for (let i = 0; i < allHoldersCount; i += step) {
                let param1 = BigInt(i);
                let param2 = BigInt(step);
                let tempHolders = await this.#actor.get_holders([param1], [param2]);

                for (let j = 0; j < tempHolders.length; j++) {
                    let holder = tempHolders[j];

                    let amount = new TokenBalance(BigInt(holder.balance), Number(this.#decimals))?.GetValue();

                    if (amount > 0) {
                        let model = new TokenHoldersItemModel();
                        model.Index = currentIndex;
                        model.Amount = parseFloat(amount.toFixed(3));
                        model.Principal = Principal.fromHex(holder.account.owner.toHex())?.toText();
                        holders[currentIndex] = model;
                        currentIndex++;
                    }
                }
                holders = holders.filter((holder) => holder && holder.Amount > 0.0);
                holders.sort((a, b) => b.Amount - a.Amount);
                // Set the correct index now
                for (let k = 0; k < holders.length; k++) {
                    holders[k].Index = k;
                }
                this.#holdersCount = holders.length;
                this.#allHoldersInformation = holders;
            }
        } catch (error) {
            console.error('Error fetching token holders:', error);
            return undefined;
        }
    }

    /**
     * Updates the token holders information.
     * This method should be called to refresh the data.
     */
    async #InternalGetHoldersAsync(): Promise<TokenHoldersItemModel[] | undefined> {
        if (this.#allHoldersInformation == undefined) {
            await this.#InternalUpdateTokenHoldersInformationAsync();
        }
        return this.#allHoldersInformation;
    }
}
