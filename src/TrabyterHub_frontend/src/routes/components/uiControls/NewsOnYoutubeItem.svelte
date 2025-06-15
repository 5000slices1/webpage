<script lang="ts">
    import {NewsOnYoutubeModelItem} from '$lib/javascript/Abstractions/news/youtube/newsOnYoutubeModelItem.js';
    let data: NewsOnYoutubeModelItem = $props();
</script>

<div class="news_item_youtube_card" style="width: 16rem; height: 20rem;">
    <table cellpadding="0" cellspacing="0" style="width: 16rem; height: 20rem;">
        <tbody>
            <tr style="height: 7rem;">
                <td class="news_item_youtube_card_text">
                    <p>
                        {data.description}
                    </p>
                </td>
            </tr>
            <tr style="height: 1rem;">
                <td class="news_item_youtube_card_view_more_item" style="padding-right: 1rem;">
                    <a
                        href={data.videoUrl}
                        target="_blank"
                        style="color: rgba(255, 255, 255, 0.6); cursor: pointer;"
                        rel="noopener noreferrer">View more...</a
                    >
                </td>
            </tr>
            <tr style="height: 8rem;">
                <td class="news_item_youtube_card_image">
                    <img
                        src="images/news/youtube/{data.thumbnailUrl}.png"
                        alt="Thumbnail"
                        style="width: 100%; height: calc(100% - 1px); object-fit: fill;
                        rounded: 0rem 0rem 2rem 2rem; border-radius: 0rem 0rem 2rem 2rem;
                        border: 0.0rem solid transparent;"
                    />
                </td>
            </tr>
        </tbody>
    </table>
</div>

<!-- public description: string;
    public thumbnailUrl: string;
    public videoUrl: string;
    public publishedAt: Date; -->

<style>
    .news_item_youtube_cards {
        max-width: 1200px;
        /* margin: 0 auto; */
        margin-left: 4rem;
        display: grid;

        row-gap: 4rem;
        /* grid-template-columns: repeat(auto-fit, minmax(30rem, 1fr)); */
    }

    .news_item_youtube_card {
        background-color: dodgerblue;
        color: white;

        background: rgba(35, 138, 212, 0.42);
        border-radius: 2rem;
        align-items: center;
        justify-content: center;
        border-radius: 2rem;
        border: 0.2rem solid rgba(24, 146, 234, 0.6);
    }

    .news_item_youtube_card_text {
        color: rgba(255, 255, 255, 0.6);
        width: 18rem;
        height: 7rem;
        /* margin: 0.5rem 0.5rem 0.5rem 0.5rem; */
        /* margin: 0.5rem auto; */
        margin-left: 2rem;
        margin-right: 2rem;
        text-align: left;
        padding: 0.5rem;
        font-weight: bold;
        font-size: medium;
    }

    .news_item_youtube_card_view_more_item {
        color: rgba(255, 255, 255, 0.6);
        width: auto;
        height: 2rem;
        /* margin: 0.5rem 0.5rem 0.5rem 0.5rem; */
        text-align: right;
        margin: 2rem auto;
        margin-right: 2rem;
        font-weight: bold;
        font-size: medium;
    }

    .news_item_youtube_card_image {
        margin: 0em;
        padding: 0em;
        /* width: 20rem;
        height: 14rem; */
        border-radius: 0rem 0rem 2rem 2rem;
    }

    @media (max-width: 600px) {
        .news_item_youtube_cards {
            grid-template-columns: repeat(1, 27rem);
        }
    }

    @media (min-width: 600px) {
        .news_item_youtube_cards {
            grid-template-columns: repeat(2, 27rem);
        }
    }

    @media (min-width: 850px) {
        .news_item_youtube_cards {
            grid-template-columns: repeat(3, 27rem);
        }
    }
</style>
