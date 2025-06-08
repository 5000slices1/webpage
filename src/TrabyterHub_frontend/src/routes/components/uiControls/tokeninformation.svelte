<script lang="ts" module>
    // Define the structure of a Ticker object, which represents data about a cryptocurrency ticker.
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

    // Define the structure of TokenInfo, which holds detailed information about a token.
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
        base_currency: string;
        wasUpdated: boolean; // Indicates whether the token information was recently updated.
    }

    // Define settings for token information, including base and target currencies and the token's canister ID.
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

    // State variable to hold an array of tickers fetched from the API.
    let tickers: Ticker[] = $state([]);

    // Props passed to the component, with default settings for token information.
    let {
        settings = {
            baseCurrency: '',
            targetCurrency: '',
            tokenCanisterId: '',
        } as TokenInformationSettings,
    } = $props<{settings?: TokenInformationSettings}>();

    // State variable to hold detailed information about the token.
    let tokenInfo: TokenInfo | undefined = $state(undefined);

    console.log('settings', settings);

    // Lifecycle hook to initialize token information when the component is mounted.
    onMount(async () => {
        // Ensure base_currency is set before proceeding
        if (settings.base_currency == '') {
            return;
        }

        // Check if tokenInfo is already stored in session storage
        if (typeof window === 'undefined') {
            console.error(
                'Session storage is not available in this environment.',
            );
            return;
        }

        // Generate a unique key for session storage based on the base currency.
        let key = 'tokenInfo' + settings.baseCurrency;
        console.log('key', key);
        const storedTokenInfo = sessionStorage.getItem(key);

        // If token information exists in session storage, use it.
        if (storedTokenInfo) {
            tokenInfo = JSON.parse(storedTokenInfo) as TokenInfo;
        }

        // If token information was recently updated, refresh it; otherwise, initialize it.
        if (tokenInfo && tokenInfo.wasUpdated) {
            await updateTokenInformation();
        } else {
            await initTokenInformation();
        }
    });

    // Fetch tickers from the API and parse the response into an array of Ticker objects.
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

    // Update token information by fetching the latest data from the actor and ticker.
    const updateTokenInformation = async () => {
        let ticker = await getTicker();
        if (ticker == null || tokenInfo == null) {
            console.error(
                'Ticker or tokenInfo is null, cannot update information.',
            );
            return;
        }

        // Create a TokenActor instance to interact with the token canister.
        let tokenActor = new TokenActor();
        let actor = await tokenActor.GetActor(settings.tokenCanisterId);

        // Fetch burned amount and total supply from the actor.
        const [burnedAmountRaw, totalSupplyRaw] = await Promise.all([
            actor.get_burned_amount(),
            actor.icrc1_total_supply(),
        ]);

        // Convert raw values into human-readable formats using TokenBalance utility.
        let totalSupply = new TokenBalance(
            BigInt(totalSupplyRaw as string),
            tokenInfo?.tokenDecimals,
        ).GetValue();
        let burnedAmount = new TokenBalance(
            BigInt(burnedAmountRaw as string),
            tokenInfo?.tokenDecimals,
        ).GetValue();

        // Update token information with the latest data.
        tokenInfo.burnedAmount = burnedAmount;
        tokenInfo.tokenSupply = totalSupply;
        tokenInfo.tokenPrice = ticker?.last_price || '';
        tokenInfo.base_currency = ticker?.base_currency || '';
        tokenInfo.wasUpdated = true;

        // Store updated token information in session storage.
        if (typeof window !== 'undefined' && tokenInfo) {
            let key = 'tokenInfo' + settings.baseCurrency;
            sessionStorage.setItem(key, JSON.stringify(tokenInfo));
        }
    };

    // Initialize token information by fetching metadata, supported standards, and other details.
    const initTokenInformation = async () => {
        let ticker = await getTicker();

        // Create a TokenActor instance to interact with the token canister.
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

            // Extract metadata details such as decimals, logo, and name.
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

            // Convert raw values into human-readable formats using TokenBalance utility.
            let totalSupply = new TokenBalance(
                BigInt(totalSupplyRaw as string),
                decimals,
            ).GetValue();

            // Extract supported token standards.
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

            // Initialize token information object.
            tokenInfo = {
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
                wasUpdated: true, // Initially set to false, will be updated later
            };
        } else {
            console.error('Actor is null, cannot fetch metadata.');
            return;
        }

        // Store initialized token information in session storage.
        if (typeof window !== 'undefined' && tokenInfo) {
            let key = 'tokenInfo' + settings.baseCurrency;

            sessionStorage.setItem(key, JSON.stringify(tokenInfo));
        }
    };

    // Find the ticker that matches the base and target currencies specified in settings.
    const getTicker = async (): Promise<Ticker | undefined> => {
        tickers = await fetchTickers();

        if (tickers == null) {
            return undefined;
        }

        let ticker = tickers.find(
            (ticker) =>
                ticker?.base_currency != null &&
                ticker.base_currency == settings.baseCurrency &&
                ticker?.target_currency != null &&
                ticker.target_currency == settings.targetCurrency,
        );

        if (ticker == null) {
            console.error(
                `Ticker not found for base currency: ${settings.baseCurrency} and target currency: ${settings.targetCurrency}`,
            );
            return undefined;
        }
        return ticker;
    };
</script>

<div>
    <p style="font-size: large;color: white;margin-left: 1rem;">
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
                <td style="color: white;">{tokenInfo?.base_currency}</td>
            </tr>
            <tr>
                <td style="color: white;">Logo:</td>
                <td style="color: white;">
                    {#if tokenInfo?.tokenLogo}
                        <img
                            id="TraBucks_TokenLogo"
                            width="50"
                            height="50"
                            alt="TRA Token Logo"
                            src={tokenInfo.tokenLogo}
                        />
                    {/if}
                </td>
            </tr>
            <tr>
                <td style="color: white;">Price on IcpSwap:</td>
                <td style="color: white;">
                    {#if tokenInfo?.tokenPrice}
                        1 ICP = {tokenInfo?.tokenPrice}
                        {tokenInfo?.base_currency}
                    {/if}
                </td>
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
