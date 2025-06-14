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
    import {TokenInformationService} from '$lib/javascript/Services/TokenInformationService';

    let tokenService = new TokenInformationService();

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
        //console.log('key', key);
        const storedTokenInfo = sessionStorage.getItem(key);

        // If token information exists in session storage, use it.
        if (storedTokenInfo) {
            tokenInfo = JSON.parse(storedTokenInfo) as TokenInfo;
        }

        // If token information was recently updated, refresh it; otherwise, initialize it.
        if (tokenInfo && tokenInfo.wasUpdated) {
            tokenInfo =
                (await tokenService.updateTokenInformationAsync(
                    settings,
                    tokenInfo,
                )) ?? tokenInfo;
        } else {
            tokenInfo =
                (await tokenService.initTokenInformationAsync(settings)) ??
                tokenInfo;
        }
    });
</script>

initTokenInformationAsync
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
