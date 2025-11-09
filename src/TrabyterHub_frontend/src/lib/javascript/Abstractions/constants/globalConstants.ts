import { AppIdentifier } from '$lib/shared/common/abstractions/types/commonTypes';

const InProduction: boolean = false;

export const TrabyterBucks_CanisterId: string = 'obaqf-viaaa-aaaak-ak3na-cai';
export const TrabyterPremium_CanisterId: string = 'ob475-vyaaa-aaaap-ahuia-cai';

export const TrabyterWebsiteUrl: string =
    InProduction
        ? 'https://c42x7-waaaa-aaaap-qp3ba-cai.icp0.io/'
        : 'http://u6s2n-gx777-77774-qaaba-cai.localhost:4943/';

export const TrabyterStakingAppUrl: string =
    InProduction
        ? 'https://2mjwp-daaaa-aaaak-qimya-cai.icp0.io'
        : 'http://ucwa4-rx777-77774-qaada-cai.localhost:4943/';


// 'https://2mjwp-daaaa-aaaak-qimya-cai.icp0.io'

// export const TrabyterStakingAppUrl: string =
//     process.env.NODE_ENV !== 'development'
//         ? 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943'
//         : 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943';

// export const TrabyterStakingAppUrl: string =
//     process.env.NODE_ENV !== 'development'
//         ? 'https://2mjwp-daaaa-aaaak-qimya-cai.icp0.io'
//         : 'https://2mjwp-daaaa-aaaak-qimya-cai.icp0.io';


export const AllowedOriginUrls: string[] = [TrabyterWebsiteUrl, TrabyterStakingAppUrl];

export const AppIdentifierToUrl: Partial<Record<AppIdentifier, string>> = {
    [AppIdentifier.MainWebsite]: TrabyterWebsiteUrl,
    [AppIdentifier.TrabyterStaking]: TrabyterStakingAppUrl,
};
