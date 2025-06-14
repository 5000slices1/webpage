<script lang="ts">
    import TrabyterTokenHolders from '../../../../components/uiControls/TrabyterTokenHolders.svelte';
    import {TrabyterPremium_CanisterId} from '$lib/javascript/Abstractions/constants/globalConstants.js';
</script>

<TrabyterTokenHolders
    settings={{
        tokenCanisterId: TrabyterPremium_CanisterId,
        tokenName: 'Trabyter Premium',
        tokenSymbol: 'TRAPRE',
        //tokenDecimals: 8,
    }}
></TrabyterTokenHolders>
