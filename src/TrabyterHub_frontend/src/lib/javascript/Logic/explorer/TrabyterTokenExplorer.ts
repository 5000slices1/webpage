import {TokenActor} from '$lib/javascript/Utils/TokenActor';
import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';

// Explorer for Trabyter Tokens
// This class is used to interact with the Trabyter Token canister

export class TrabyterTokenExplorer {
    #canisterId: string;
    #actor: any;

    constructor(canisterId: string) {
        this.#canisterId = canisterId;
    }

    async InitializeAsync() {
        let tokenActor = new TokenActor();
        this.#actor = await tokenActor.GetActor(this.#canisterId);
    }

    async TransactionsCountAsync() {
        if (this.#actor == null) {
            return null;
        }
        let count = await this.#actor.get_total_tx();
        return count;
    }
}
