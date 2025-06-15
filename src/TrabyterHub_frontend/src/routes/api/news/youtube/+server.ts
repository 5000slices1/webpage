import {NewsOnYoutubeModelItem} from '$lib/javascript/Abstractions/news/youtube/newsOnYoutubeModelItem.js';

import {json} from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
    let items: NewsOnYoutubeModelItem[] = [];
    items.push(
        new NewsOnYoutubeModelItem(
            'Earn CHAT airdrops by accumulating CHIT daily',
            'NewsItemImage1',
            'https://youtu.be/MDk0VPTFUPA',
            new Date('2023-10-01T12:00:00Z'),
        ),
        new NewsOnYoutubeModelItem(
            'ICP STAKING: A new way to stake ICP',
            'NewsItemImage2',
            'https://youtu.be/YwdcV3S2_oY',
            new Date('2023-10-01T12:00:00Z'),
        ),
        new NewsOnYoutubeModelItem(
            'How to Swap $SLI & $GLDS to $TRA & $TRAPRE',
            'NewsItemImage3',
            'https://youtu.be/Sqa6f3K6C0I',
            new Date('2023-10-01T12:00:00Z'),
        ),
        new NewsOnYoutubeModelItem(
            'BEST WAY to learn MOTOKO Programming Language',
            'NewsItemImage4',
            'https://youtu.be/YFGsCPLpEo4',
            new Date('2023-10-01T12:00:00Z'),
        ),
    );

    return json(items);
    //return json({time: new Date().toISOString()});
    //return JSON.stringify('hello');
    //return json('message:hello');
}
