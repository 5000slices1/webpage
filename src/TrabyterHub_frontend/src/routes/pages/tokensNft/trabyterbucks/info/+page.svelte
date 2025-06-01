<script lang="ts">
    import {onMount} from 'svelte';
    import TokenInformation from '$lib/../routes/components/uiControls/tokeninformation.svelte';

    console.log('Trabyter Bucks Token Information page loaded');
    onMount(async () => {
        //ticker = await PriceFetcher.getTicker('TRA', 'ICP');
        //document.title = 'Trabyter Bucks Token Information';
    });
</script>

<TokenInformation />
