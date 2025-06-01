<script lang="ts">
    import {onMount} from 'svelte';
    import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';

    onMount(async () => {
        //ticker = await PriceFetcher.getTicker('TRA', 'ICP');
        document.title = 'Trabyter Bucks Token Information';
    });
    console.log('Deposit page loaded');
</script>

<TokenInformation />
