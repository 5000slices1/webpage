<script lang="ts" module>
    export interface Ticker {
        ticker_id: string;
        ticker_name: string;
        base_id: string;
        base_currency: string;
        target_id: string;
        target_currency: string;
        last_price: string;
        base_volume: string;
        target_volume: string;
        base_volume_24H: string;
        target_volume_24H: string;
        total_volume_usd: string;
        volume_usd_24H: string;
        fee_usd: string;
        liquidity_in_usd: string;
    }

    export interface TokenInfo {
        tokenName: string;
        tokenSymbol: string;
        tokenLogo: string;
        tokenPrice: string;
        supportedTokenTypes: string;
        canisterId: string;
        tokenDecimals: number;
        tokenSupply: number;
        burnedAmount: number;
    }

    export interface TokenInformationSettings {
        baseCurrency: string;
        targetCurrency: string;
        tokenCanisterId: string;
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

    let tickers: Ticker[] = $state([]);
    let settings: TokenInformationSettings = $state({
        baseCurrency: 'TRA',
        targetCurrency: 'ICP',
        tokenCanisterId: 'obaqf-viaaa-aaaak-ak3na-cai', // Example canister ID for TRA token
    });
    let ticker: Ticker | undefined = $state(undefined);

    let tokenInfo: TokenInfo | undefined = $state(undefined);

    onMount(async () => {
        await initTokenInformation();
    });

    const fetchTickers = async (): Promise<Ticker[]> => {
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
    };

    const getTicker = async (
        baseCurrency: string,
        targetCurrency: string,
    ): Promise<Ticker | undefined> => {
        if (tickers == null) {
            return undefined;
        }

        let ticker = tickers.find(
            (ticker) =>
                ticker?.base_currency != null &&
                ticker.base_currency == baseCurrency &&
                ticker?.target_currency != null &&
                ticker.target_currency == targetCurrency,
        );
        return ticker;
    };

    const initTokenInformation = async () => {
        await updateTicker();

        let tokenActor = new TokenActor();
        let actor = await tokenActor.GetActor(settings.tokenCanisterId);

        if (actor) {
            let metadata = await actor.icrc1_metadata();
            console.log('Metadata:', metadata);
            let decimals: number = 8;
            let logoBase64: string | undefined = undefined;

            if (metadata) {
                let metaDic = GetCustomDictionaryFromVariant(metadata);
                decimals = Number(
                    GetValueFromDictionary(metaDic, 'icrc1:decimals'),
                );
                logoBase64 = GetValueFromDictionary(metaDic, 'icrc1:logo');
            } else {
                console.error('Metadata is null or undefined.');
            }

            let totalSupplyRaw = BigInt(
                (await actor.icrc1_total_supply()) as string,
            );
            let totalSupply = new TokenBalance(
                totalSupplyRaw,
                decimals,
            ).GetValue();

            let tokenStandards: any = await actor.icrc1_supported_standards();
            var tokenStandardsString = '';
            for (let item of tokenStandards) {
                console.log(item);
                let objectEntries = Object.entries(item);
                let standardValue = objectEntries[1][1];
                tokenStandardsString += standardValue + ' ';
            }
            let supportedStandards = tokenStandardsString;

            let burnedAmountRaw = BigInt(
                (await actor.get_burned_amount()) as string,
            );
            let burnedAmount = new TokenBalance(
                burnedAmountRaw,
                decimals,
            ).GetValue();
            tokenInfo = {
                tokenName: ticker?.ticker_name || 'Unknown Token',
                tokenSymbol: ticker?.base_currency || 'Unknown Symbol',
                tokenLogo: logoBase64
                    ? //? `data:image/png;base64,${logoBase64}`
                      logoBase64
                    : '',
                tokenPrice: ticker?.last_price || 'N/A',
                supportedTokenTypes: supportedStandards,
                canisterId: settings.tokenCanisterId,
                tokenDecimals: decimals,
                tokenSupply: totalSupply,
                burnedAmount: burnedAmount,
            };
        } else {
            console.error('Actor is null, cannot fetch metadata.');
        }
    };
    const updateTicker = async () => {
        tickers = await fetchTickers();
        ticker = await getTicker(
            settings.baseCurrency,
            settings.targetCurrency,
        );
    };
</script>

<div>
    <br />
    <br />
    <p style="font-size: large;color: white;">
        Token information for {tokenInfo?.tokenSymbol} Token:
    </p>
    <table style="border-spacing: 1rem;">
        <colgroup>
            <col style="width: 20rem;" />
            <col style="width: 20rem;" />
        </colgroup>
        <tbody>
            <tr>
                <td style="color: white;">Token Name:</td>
                <td style="color: white;">{tokenInfo?.tokenName}</td>
            </tr>
            <tr>
                <td style="color: white;">Token Symbol:</td>
                <td style="color: white;">{ticker?.base_currency}</td>
            </tr>
            <tr>
                <td style="color: white;">Logo:</td>
                <td style="color: white;">
                    <img
                        id="TraBucks_TokenLogo"
                        width="50"
                        height="50"
                        alt="TRA Token Logo"
                        src={tokenInfo?.tokenLogo
                            ? `${tokenInfo.tokenLogo}`
                            : ''}
                    />
                </td>
            </tr>
            <tr>
                <td style="color: white;">Price on IcpSwap:</td>
                <td style="color: white;">{ticker?.last_price}</td>
            </tr>
            <tr>
                <td style="color: white;">Supported Types:</td>
                <td style="color: white;">{tokenInfo?.supportedTokenTypes}</td>
            </tr>
            <tr>
                <td style="color: white;">Token Canister-Id:</td>
                <td style="color: white;">{tokenInfo?.canisterId}</td>
            </tr>
            <tr>
                <td style="color: white;">Token Decimals:</td>
                <td style="color: white;">{tokenInfo?.tokenDecimals}</td>
            </tr>
            <tr>
                <td style="color: white;">Token Supply:</td>
                <td style="color: white;">{tokenInfo?.tokenSupply}</td>
            </tr>
            <tr>
                <td style="color: white;">Burned amount:</td>
                <td style="color: white;">{tokenInfo?.burnedAmount}</td>
            </tr>
        </tbody>
    </table>
</div>
