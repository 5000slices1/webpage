<script lang="ts">
    import {NewsOnDevelopmentModelItem} from '$lib/javascript/Abstractions/news/development/newsOnDevelopmentModelItem.js';
    import {json} from '@sveltejs/kit';
    import NewsOndevelopmentstatusItem from '../../../components/uiControls/NewsOnDevelopmentState.svelte';
    import {onMount} from 'svelte';
    import {fade, fly, slide, scale} from 'svelte/transition';
    let data = $props();
    let items: NewsOnDevelopmentModelItem[] = $state([]);

    async function fetchDataFromServer() {
        // This function can be used to fetch data from the server if needed
        // For now, we assume data is passed as props
        const response = await fetch('/api/news/development');

        if (!response.ok) {
            throw new Error('Failed to fetch news data');
        }

        const jsonObject: any = await response.json();

        if (!jsonObject) {
            console.error('No data received from the server');
            return;
        }
        // Assuming jsonString is an array of NewsOndevelopmentstatusItem objects
        items = jsonObject as NewsOnDevelopmentModelItem[];
        console.log('items', items);
    }

    onMount(async () => {
        await fetchDataFromServer();
    });
</script>

<div class="content-control-div" style="width: 100%; height: 100%; margin-top: 0.4rem;color:white">
    <div class="inner-content-control-spacing" style="width: auto;">
        <div style="margin-left:2rem;margin-top: 1rem;">
            {#if items.length > 0}
                <div class="data-grid">
                    {#each items as item}
                        <div class="data-item">
                            <NewsOndevelopmentstatusItem {...item} />
                        </div>
                    {/each}
                </div>
            {/if}
        </div>
    </div>
</div>

<style>
    .data-grid {
        display: grid;
        grid-template-columns: 15rem repeat(auto-fit, minmax(15rem, 15rem));
        column-gap: min(4rem, 100%);
        row-gap: 2rem;
        transition: opacity 1.5s ease-in-out;
    }

    .data-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: opacity 1.5s ease-in-out;
    }

    .data-item:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease-in-out;
    }
</style>
