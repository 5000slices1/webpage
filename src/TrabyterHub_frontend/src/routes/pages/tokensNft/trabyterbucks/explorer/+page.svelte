<script lang="ts">
    import TrabyterTokenExplorer from '../../../../components/uiControls/TrabyterTokenExplorer.svelte';
    import {TrabyterBucks_CanisterId} from '$lib/javascript/Abstractions/constants/globalConstants.js';
</script>

<TrabyterTokenExplorer
    settings={{
        tokenCanisterId: TrabyterBucks_CanisterId,
        tokenName: 'Trabyter Bucks',
        tokenSymbol: 'TRA',
        tokenDecimals: 8,
    }}
></TrabyterTokenExplorer>
