<script lang="ts">
    import {NewsOnDevelopmentModelItem} from '$lib/javascript/Abstractions/news/development/newsOnDevelopmentModelItem';

    let data: NewsOnDevelopmentModelItem = $props();
</script>

<div class="news_item_developmentstatus_card" style="width: 16rem; height: 37rem;">
    <table cellpadding="0" cellspacing="0" style="width: 16rem; height: 37rem;margin:0rem;padding:0rem;">
        <tbody>
            <tr style="margin-top:0.1rem; height:1rem;">
                <td class="news_item_developmentstatus_card_text">
                    <p>
                        TraByter - {data.title}
                    </p>
                </td>
            </tr>

            <tr style="height: 12rem;">
                <td class="news_item_developmentstatus_card_image" style="padding:0.5rem;">
                    <img
                        src="images/news/development/{data.thumbnailUrl}.png"
                        alt="Thumbnail"
                        style="width: 100%; height: 12rem; object-fit: fill;
                        border: 0.0rem solid white;"
                    />
                </td>
            </tr>

            <tr>
                <td class="news_item_developmentstatus_card_text">
                    <p style="margin-top: 0; vertical-align: top;">
                        Status:
                        <span
                            style="margin-left:0.5rem;color: {data.developmentStatus === 'Completed'
                                ? 'lightgreen'
                                : data.developmentStatus === 'InProgress'
                                  ? 'yellow'
                                  : 'red'};"
                        >
                            {data.developmentStatus}
                        </span>
                    </p>
                </td>
            </tr>

            <tr>
                <td
                    class="news_item_developmentstatus_card_text"
                    style="margin-top: 0.0rem; vertical-align: top;
                    padding-top:0.0rem;
                    height:10rem;
                    font-size: 1.0rem; "
                >
                    <p>
                        {data.description}
                    </p>
                </td>
            </tr>
            <tr style="height: 1rem;">
                <td>
                    <br />
                </td>
            </tr>
            <tr>
                <td>
                    {#if data.developmentStatus === 'Completed'}
                        <button
                            class="div-app-button-open-app"
                            style="width: 100%; height:2.3rem;
                            width:12rem;margin-left: 2rem; margin-right: 2rem;
                            vertical-align: bottom;
                            horizontal-align: center;
                            cursor: pointer;"
                            onclick={() => {
                                window.open(data.url, '_blank');
                            }}
                        >
                            Open App
                        </button>
                    {:else}
                        <div style="height: 2.3rem; width: 2rem;"></div>
                    {/if}
                </td>
            </tr>
        </tbody>
    </table>
</div>

<style>
    .news_item_developmentstatus_card {
        background-color: dodgerblue;
        color: white;

        background: rgba(35, 138, 212, 0.42);
        border-radius: 2rem;
        align-items: center;
        justify-content: center;
        border-radius: 2rem;
        border: 0.2rem solid rgba(24, 146, 234, 0.6);
    }

    .news_item_developmentstatus_card_text {
        color: rgba(255, 255, 255, 0.6);
        margin-left: 2rem;
        margin-right: 2rem;
        text-align: left;
        padding: 0.5rem;
        font-weight: bold;
        font-size: medium;
    }

    .news_item_developmentstatus_card_image {
        margin: 0em;
        padding: 0em;
    }

    .div-app-button-open-app {
        width: 100%;
        height: 2.3rem;
        background: #548fe8;
        border: 0.15rem solid #1c72f3;
        border-radius: 0.8rem;

        font-style: normal;
        font-weight: bold;
        font-size: larger;
        align-items: center;
        text-align: center;
        letter-spacing: 0.03rem;
        /* Button Default Text color */
        color: #c2c9d3;
    }

    .div-app-button-open-app:hover {
        background: #1c72f3;
        color: white;
        border-color: #0f5ac6;
        transition:
            background 0.3s,
            color 0.3s,
            border-color 0.3s;
    }

    .div-app-button-open-app:active {
        background: #0f5ac6;
        color: #d4e1f5;
        border-color: #0a3e8e;
        transition:
            background 0.1s,
            color 0.1s,
            border-color 0.1s;
    }
</style>
