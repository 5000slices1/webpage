import {
    DevelopmentStatus,
    NewsOnDevelopmentModelItem,
} from '$lib/javascript/Abstractions/news/development/newsOnDevelopmentModelItem';

import {json} from '@sveltejs/kit';

export const prerender = true;

export async function GET() {
    // Define an array to hold items of type NewsOndevelopmentstatusModelItem

    let items: NewsOnDevelopmentModelItem[] = [];
    items.push(
        new NewsOnDevelopmentModelItem(
            'SwapApp',
            `The SwapApp is for converting the old SLI / GLDS tokens into the new Trabyter / Trabyter-Premium Tokens.
The conversion rate is 1:1.
During the conversion process, the old tokens will be burnt.`,
            'SwapAppLogo',
            'https://swapapp.trabyter.com/',
            DevelopmentStatus.Completed,
        ),
        new NewsOnDevelopmentModelItem(
            'NFT Staking',
            `Here you can stake your Slices NFT to get some rewards.
            We will also add the possibility that other Teams can create their Nft-Stake pool for their NFT’s.`,
            'StakingAppTreeLogo',
            '',
            DevelopmentStatus.InProgress,
        ),
        new NewsOnDevelopmentModelItem(
            'Trade By Barter',
            `Here you can buy / sell Nft's by trade by Barter.
            This means you can sell / buy basket of different NFT's at once.`,
            'NftMarketAppBuyLogo',
            '',
            DevelopmentStatus.NotStarted,
        ),
    );

    return json(items);
}
