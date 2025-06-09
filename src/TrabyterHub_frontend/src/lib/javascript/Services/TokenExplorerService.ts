import {TokenActor} from '$lib/javascript/Utils/TokenActor';
import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';

import {Principal} from '@dfinity/principal';

// Explorer for Trabyter Tokens
// This class is used to interact with the Trabyter Token canister

export class TokenExplorerItem {
    TransactionType: string = '';
    From: string = '';
    To: string = '';
    Amount: number = 0;
    DateTimeString: string = '';
    txIndex: number = 0;
}

export class TokenExplorerResponse {
    items: TokenExplorerItem[] = [];
    totalCount: number = 0;
    firstTx: number = 0;
    lastTx: number = 0;
    //firstPageNumber: number = 0;
    //lastPageNumber: number = 0;
    //currentPageNumber: number = 0;
    //hasNextPage: boolean = false;
    //hasPreviousPage: boolean = false;
    errorMessage: string | null = null;
    hasError: boolean = false;
}

export enum TokenExplorerSearchMode {
    SearchByTxId = 'SearchByTxId',
    SearchByPrincipal = 'SearchByPrincipal',
}

// Settings for the Token Explorer
export class TokenExplorerSettings {
    canisterId: string = ''; // The canister ID of the token canister
    decimals: number = 8; // The number of decimals for the token, default is 8

    // In the Ui page this is the Rows per page
    //maxItemsCount: number = 10; // The maximum number of items to return in a single request
    //searchMode: TokenExplorerSearchMode = TokenExplorerSearchMode.SearchByTxId; // The search mode to use, default is SearchByTxId
    //searchValue: string = ''; // The value to search for, can be a transaction ID or a principal ID
}

export class TokenExplorerService {
    #tokenExplorerSettings: TokenExplorerSettings;
    #actor: any;

    constructor(canisterId: string) {
        this.#tokenExplorerSettings = new TokenExplorerSettings();
        this.#tokenExplorerSettings.canisterId = canisterId;
    }

    async InitializeAsync() {
        let tokenActor = new TokenActor();
        this.#actor = await tokenActor.GetActor(
            this.#tokenExplorerSettings.canisterId,
        );
    }

    async GetTransactionsByStartTxIdAsync(
        startTxId: number,
        maxItemsCount: number = 10,
    ): Promise<TokenExplorerResponse | undefined> {
        var result: TokenExplorerResponse | undefined =
            new TokenExplorerResponse();

        if (this.#actor == null) {
            result.hasError = true;
            result.errorMessage = 'Actor is not initialized.';
            return result;
        }

        try {
            let maxLength = maxItemsCount;
            let transactions = await this.#actor.get_transactions_by_index(
                startTxId,
                maxLength,
            );
            var convertedTransactions =
                await this.#ConvertTransactionResponseIntoOwnArray(
                    transactions,
                );
            result.items = convertedTransactions.sort(
                (a, b) => b.txIndex - a.txIndex,
            );
            result.totalCount = convertedTransactions.length;
            result.firstTx = Math.max(
                ...convertedTransactions.map((tx) => tx.txIndex),
            );
            result.lastTx = Math.min(
                ...convertedTransactions.map((tx) => tx.txIndex),
            );
        } catch (error) {
            result.hasError = true;
            result.errorMessage = `Error while getting transactions: ${error}`;
        }
        return result;
    }

    async TotalTxCountAsync() {
        if (this.#actor == null) {
            return null;
        }
        let count = await this.#actor.get_total_tx();
        return count;
    }

    // #region Helpers methods
    async #ConvertTransactionResponseIntoOwnArray(
        transactionsResponse: any[],
    ): Promise<TokenExplorerItem[]> {
        const transactions = new Array(transactionsResponse.length);

        //Now we need to convert
        for (let i = 0; i < transactionsResponse.length; i++) {
            let transaction = transactionsResponse[i];
            let model: TokenExplorerItem = new TokenExplorerItem();
            model.TransactionType = transaction.kind;

            switch (model.TransactionType.toLowerCase()) {
                case 'mint':
                    this.#Update_ModelItem_common_values(
                        model,
                        transaction.mint[0],
                    );
                    break;
                case 'burn':
                    this.#Update_ModelItem_common_values(
                        model,
                        transaction.burn[0],
                    );
                    break;
                case 'transfer':
                    this.#Update_ModelItem_common_values(
                        model,
                        transaction.transfer[0],
                    );
                    break;
                default:
                    continue;
            }

            model.DateTimeString = this.#TimeTicksNanoseconds_To_DateTimeString(
                transaction.timestamp,
            );
            model.txIndex = Number(transaction.index);
            transactions[i] = model;
        }
        return transactions;
    }

    #TimeTicksNanoseconds_To_DateTimeString(ticksNanoSeconds: any) {
        if (ticksNanoSeconds == null || ticksNanoSeconds === '') {
            return '';
        }
        let timeTicksNanoSeconds = Number(ticksNanoSeconds);
        let timeTicksMilliSeconds = Math.trunc(
            Number(timeTicksNanoSeconds / 1000000),
        );
        let date = new Date(Number(timeTicksMilliSeconds));
        return date.toLocaleString();
    }

    #Update_ModelItem_common_values(
        model: TokenExplorerItem,
        transaction: any,
    ) {
        let rawAmount = transaction?.amount;
        let rawTo = transaction?.to?.owner;
        let rawFrom = transaction?.from?.owner;

        let decimals = this.#tokenExplorerSettings.decimals;

        if (rawAmount != null) {
            model.Amount = new TokenBalance(
                BigInt(rawAmount),
                Number(decimals),
            )?.GetValue();
        } else {
            model.Amount = 0;
        }

        if (rawTo != null) {
            model.To = Principal.fromHex(rawTo?.toHex())?.toText();
        } else {
            model.To = '';
        }

        if (rawFrom != null) {
            model.From = Principal.fromHex(rawFrom?.toHex())?.toText();
        } else {
            model.From = '';
        }
    }

    // #endregion Helpers methods
}
