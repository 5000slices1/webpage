export const TrabyterBucks_CanisterId: string = 'obaqf-viaaa-aaaak-ak3na-cai';
export const TrabyterPremium_CanisterId: string = 'ob475-vyaaa-aaaap-ahuia-cai';

export const TrabyterStakingAppUrl: string =
    process.env.NODE_ENV !== 'development'
        ? 'http://ucwa4-rx777-77774-qaada-cai.localhost:4943/'
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


export const AllowedOriginUrls: string[] = [TrabyterStakingAppUrl];
