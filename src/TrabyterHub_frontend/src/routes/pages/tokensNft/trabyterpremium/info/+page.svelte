<script lang="ts">
    import {onMount} from 'svelte';
    import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';
    import type {TokenInformationSettings} from '$lib/../routes/components/uiControls/tokeninformation.svelte';
    import {TrabyterPremium_CanisterId} from '$lib/javascript/Abstractions/constants/globalConstants.js';
    onMount(async () => {
        //ticker = await PriceFetcher.getTicker('TRA', 'ICP');
        //document.title = 'Trabyter Bucks Token Information';
    });
</script>

<TokenInformation
    settings={{
        baseCurrency: 'TRAPRE',
        targetCurrency: 'ICP',
        tokenCanisterId: TrabyterPremium_CanisterId,
    } as TokenInformationSettings}
/>
