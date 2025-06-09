import {
    GetCustomDictionaryFromVariant,
    GetValueFromDictionary,
} from '$lib/javascript/Utils/CommonUtils';
import {TokenActor} from '$lib/javascript/Utils/TokenActor';
import {TokenBalance} from '$lib/javascript/Utils/TokenBalance';

import type {
    Ticker,
    TokenInfo,
    TokenInformationSettings,
} from '$lib/../routes/components/uiControls/tokeninformation.svelte';

export class TokenInformationService {
    async fetchTickersAsync(): Promise<Ticker[]> {
        const response = await fetch(
            'https://uvevg-iyaaa-aaaak-ac27q-cai.raw.ic0.app/tickers',
        );
        if (!response.ok) {
            throw new Error('Failed to fetch ticker data');
        }
        let jsonObject = await response.json();
        if (jsonObject) {
            let tickers: Ticker[] = [];
            for (const key in jsonObject) {
                if (jsonObject.hasOwnProperty(key)) {
                    const tickerData = jsonObject[key];
                    const ticker: Ticker = {
                        ticker_id: tickerData.ticker_id,
                        ticker_name: tickerData.ticker_name,
                        base_id: tickerData.base_id,
                        base_currency: tickerData.base_currency,
                        target_id: tickerData.target_id,
                        target_currency: tickerData.target_currency,
                        last_price: tickerData.last_price,
                        base_volume: tickerData.base_volume,
                        target_volume: tickerData.target_volume,
                        base_volume_24H: tickerData.base_volume_24H,
                        target_volume_24H: tickerData.target_volume_24H,
                        total_volume_usd: tickerData.total_volume_usd,
                        volume_usd_24H: tickerData.volume_usd_24H,
                        fee_usd: tickerData.fee_usd,
                        liquidity_in_usd: tickerData.liquidity_in_usd,
                    };
                    tickers.push(ticker);
                }
            }
            return tickers;
        }
        return [];
    }

    async getTickerAsync(
        settings: TokenInformationSettings,
    ): Promise<Ticker | undefined> {
        const tickers = await this.fetchTickersAsync();
        return tickers.find(
            (ticker) =>
                ticker?.base_currency != null &&
                ticker.base_currency == settings.baseCurrency &&
                ticker?.target_currency != null &&
                ticker.target_currency == settings.targetCurrency,
        );
    }

    async updateTokenInformationAsync(
        settings: TokenInformationSettings,
        tokenInfo: TokenInfo,
    ): Promise<TokenInfo | undefined> {
        let ticker = await this.getTickerAsync(settings);
        if (!ticker || !tokenInfo) {
            console.error(
                'Ticker or tokenInfo is null, cannot update information.',
            );
            return;
        }
        let tokenActor = new TokenActor();
        let actor = await tokenActor.GetActor(settings.tokenCanisterId);

        const [burnedAmountRaw, totalSupplyRaw] = await Promise.all([
            actor.get_burned_amount(),
            actor.icrc1_total_supply(),
        ]);

        let totalSupply = new TokenBalance(
            BigInt(totalSupplyRaw as string),
            tokenInfo?.tokenDecimals,
        ).GetValue();
        let burnedAmount = new TokenBalance(
            BigInt(burnedAmountRaw as string),
            tokenInfo?.tokenDecimals,
        ).GetValue();

        tokenInfo.burnedAmount = burnedAmount;
        tokenInfo.tokenSupply = totalSupply;
        tokenInfo.tokenPrice = ticker?.last_price || '';
        tokenInfo.base_currency = ticker?.base_currency || '';
        tokenInfo.wasUpdated = true;

        if (typeof window !== 'undefined' && tokenInfo) {
            let key = 'tokenInfo' + settings.baseCurrency;
            sessionStorage.setItem(key, JSON.stringify(tokenInfo));
        }
        return tokenInfo;
    }

    async initTokenInformationAsync(
        settings: TokenInformationSettings,
    ): Promise<TokenInfo | undefined> {
        let ticker = await this.getTickerAsync(settings);
        let tokenActor = new TokenActor();
        let actor = await tokenActor.GetActor(settings.tokenCanisterId);

        if (actor) {
            const [burnedAmountRaw, metadata, tokenStandards, totalSupplyRaw] =
                await Promise.all([
                    actor.get_burned_amount(),
                    actor.icrc1_metadata(),
                    actor.icrc1_supported_standards(),
                    actor.icrc1_total_supply(),
                ]);

            let decimals: number = 8;
            let logoBase64: string | undefined = undefined;
            let name: string = '';
            if (metadata) {
                let metaDic = GetCustomDictionaryFromVariant(metadata);
                decimals = Number(
                    GetValueFromDictionary(metaDic, 'icrc1:decimals'),
                );
                logoBase64 = GetValueFromDictionary(metaDic, 'icrc1:logo');
                name = GetValueFromDictionary(metaDic, 'icrc1:name');
            } else {
                console.error('Metadata is null or undefined.');
            }

            let totalSupply = new TokenBalance(
                BigInt(totalSupplyRaw as string),
                decimals,
            ).GetValue();

            var tokenStandardsString = '';
            for (let item of tokenStandards as any) {
                let objectEntries = Object.entries(item);
                let standardValue = objectEntries[1][1];
                tokenStandardsString += standardValue + ' ';
            }
            let supportedStandards = tokenStandardsString;

            let burnedAmount = new TokenBalance(
                BigInt(burnedAmountRaw as string),
                decimals,
            ).GetValue();

            let tokenInfo: TokenInfo = {
                tokenName: name || 'Unknown Token',
                tokenSymbol: ticker?.base_currency || 'Unknown Symbol',
                tokenLogo: logoBase64 ? logoBase64 : '',
                tokenPrice: ticker?.last_price || 'N/A',
                supportedTokenTypes: supportedStandards,
                canisterId: settings.tokenCanisterId,
                tokenDecimals: decimals,
                tokenSupply: totalSupply,
                burnedAmount: burnedAmount,
                base_currency: ticker?.base_currency || '',
                wasUpdated: true,
            };

            if (typeof window !== 'undefined' && tokenInfo) {
                let key = 'tokenInfo' + settings.baseCurrency;
                sessionStorage.setItem(key, JSON.stringify(tokenInfo));
            }
            return tokenInfo;
        } else {
            console.error('Actor is null, cannot fetch metadata.');
            return;
        }
    }
}
