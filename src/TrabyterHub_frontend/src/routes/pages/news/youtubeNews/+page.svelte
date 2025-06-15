<script lang="ts">
    import {NewsOnYoutubeModelItem} from '$lib/javascript/Abstractions/news/youtube/newsOnYoutubeModelItem.js';
    import {json} from '@sveltejs/kit';
    import NewsOnYoutubeItem from '../../../components/uiControls/NewsOnYoutubeItem.svelte';
    import {onMount} from 'svelte';
    import {fade, fly, slide, scale} from 'svelte/transition';
    let data = $props();
    let newsItems: NewsOnYoutubeModelItem[] = $state([]);

    async function fetchDataFromServer() {
        // This function can be used to fetch data from the server if needed
        // For now, we assume data is passed as props
        const response = await fetch('/api/news/youtube');

        if (!response.ok) {
            throw new Error('Failed to fetch news data');
        }

        const jsonObject: any = await response.json();

        if (!jsonObject) {
            console.error('No data received from the server');
            return;
        }
        // Assuming jsonString is an array of NewsOnYoutubeItem objects
        newsItems = jsonObject as NewsOnYoutubeModelItem[];
    }

    onMount(async () => {
        await fetchDataFromServer();
    });
</script>

<div class="content-control-div" style="width: 100%; height: 100%; margin-top: 0.4em;color:white">
    <div class="inner-content-control-spacing" style="width: auto;">
        <h1 style="margin-left: 1.5rem;">Top Stories</h1>
        <br />
        <div style="margin-left:2rem;">
            {#if newsItems.length > 0}
                <div class="news-grid">
                    {#each newsItems as newsItem}
                        <div class="news-item">
                            <NewsOnYoutubeItem {...newsItem} />
                        </div>
                    {/each}
                </div>
            {:else}
                <p>No news items available.</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .news-grid {
        display: grid;
        grid-template-columns: 15rem repeat(auto-fit, minmax(15rem, 15rem));
        column-gap: min(4rem, 100%);
        row-gap: 2rem;
        transition: opacity 1.5s ease-in-out;
    }

    .news-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        transition: opacity 1.5s ease-in-out;
    }

    .news-item:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease-in-out;
    }
    .news-item:active {
        transform: scale(0.95);
        transition: transform 0.1s ease-in-out;
    }
    .news-item:focus {
        outline: none;
    }
    .news-item:focus-visible {
        outline: 0.2rem solid rgba(24, 146, 234, 0.6);
        outline-offset: 0.2rem;
    }
    .news-item:focus-within {
        outline: 0.2rem solid rgba(24, 146, 234, 0.6);
        outline-offset: 0.2rem;
    }
    .news-item:focus-within:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease-in-out;
    }
    .news-item:focus-within:active {
        transform: scale(0.95);
        transition: transform 0.1s ease-in-out;
    }
    .news-item:focus-within:focus {
        outline: none;
    }
    .news-item:focus-within:focus-visible {
        outline: 0.2rem solid rgba(24, 146, 234, 0.6);
        outline-offset: 0.2rem;
    }
    .news-item:focus-within:focus-visible:hover {
        transform: scale(1.05);
        transition: transform 0.3s ease-in-out;
    }
    .news-item:focus-within:focus-visible:active {
        transform: scale(0.95);
        transition: transform 0.1s ease-in-out;
    }
    .news-item:focus-within:focus-visible:focus {
        outline: none;
    }
</style>
