<script lang="ts">
    import TrabyterTokenExplorer from '../../../../components/uiControls/TrabyterTokenExplorer.svelte';
    import {TrabyterPremium_CanisterId} from '$lib/javascript/Abstractions/constants/globalConstants.js';
</script>

<TrabyterTokenExplorer
    settings={{
        tokenCanisterId: TrabyterPremium_CanisterId,
        tokenName: 'Trabyter Premium',
        tokenSymbol: 'TRAPRE',
        tokenDecimals: 8,
    }}
></TrabyterTokenExplorer>
