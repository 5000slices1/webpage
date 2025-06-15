<script lang="ts">
    import TrabyterTokenHolders from '../../../../components/uiControls/TrabyterTokenHolders.svelte';
    import {TrabyterBucks_CanisterId} from '$lib/javascript/Abstractions/constants/globalConstants.js';
</script>

<TrabyterTokenHolders
    settings={{
        tokenCanisterId: TrabyterBucks_CanisterId,
        tokenName: 'Trabyter Bucks',
        tokenSymbol: 'TRA',
        //tokenDecimals: 8,
    }}
></TrabyterTokenHolders>
