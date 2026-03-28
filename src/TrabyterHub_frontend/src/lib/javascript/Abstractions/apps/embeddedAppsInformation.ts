export enum AppName {
    None = 'None',
    SwapApp = 'Swap App',
    NftMarketApp = 'Nft Market App',
    NftStaking = 'Nft Staking',
}

export class EmbeddedAppsInformation {
    CurrentlyEmbeddedApp: AppName = AppName.None;
}
