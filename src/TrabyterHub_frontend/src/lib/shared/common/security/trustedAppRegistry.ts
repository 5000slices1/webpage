import { AppIdentifier } from '../abstractions/types/commonTypes';

export interface TrustedAppConfig
{
    allowedOrigins: string[];
    publicKeyFingerprint?: string;  // SHA-256 hash of encryption public key
    signingKeyFingerprint?: string; // SHA-256 hash of signing public key
    description?: string;
}

const InProduction: boolean = false;
export const TrabyterWebsiteUrl: string =
    InProduction
        ? 'https://c42x7-waaaa-aaaap-qp3ba-cai.icp0.io'
        : 'http://ucwa4-rx777-77774-qaada-cai.localhost:4943';

export const TrabyterStakingAppUrl: string =
    InProduction
        ? 'https://2mjwp-daaaa-aaaak-qimya-cai.icp0.io'
        : 'http://uzt4z-lp777-77774-qaabq-cai.localhost:4943';


export const AllowedOriginUrls: string[] = [TrabyterWebsiteUrl, TrabyterStakingAppUrl];

export const AppIdentifierToUrl: Partial<Record<AppIdentifier, string>> = {
    [AppIdentifier.MainWebsite]: TrabyterWebsiteUrl,
    [AppIdentifier.TrabyterStaking]: TrabyterStakingAppUrl,
};



/**
 * Registry of trusted applications with their expected origins and public key fingerprints.
 * Prevents MITM attacks during key exchange by verifying received keys match expected values.
 */
export class TrustedAppRegistry
{
    // Registry of trusted apps with their configurations
    private static trustedApps: Map<AppIdentifier, TrustedAppConfig> = new Map([
        [
            AppIdentifier.TrabyterStaking,
            {
                allowedOrigins: [
                    AppIdentifierToUrl[AppIdentifier.TrabyterStaking]!,
                    'https://staking.trabyter.com',
                ],
                // Note: Fingerprints should be generated once and stored securely
                // To generate: await TrustedAppRegistry.generateKeyFingerprint(publicKey)
                publicKeyFingerprint: undefined, // Set this after first key generation
                signingKeyFingerprint: undefined, // Set this after first key generation
                description: 'Trabyter Staking Application',
            },
        ],
        [
            AppIdentifier.MainWebsite,
            {
                allowedOrigins: [
                    AppIdentifierToUrl[AppIdentifier.MainWebsite]!,
                    'https://trabyter.com',

                ],
                // Note: Fingerprints should be generated once and stored securely
                // To generate: await TrustedAppRegistry.generateKeyFingerprint(publicKey)
                publicKeyFingerprint: undefined, // Set this after first key generation
                signingKeyFingerprint: undefined, // Set this after first key generation
                description: 'Trabyter Main Website',
            },
        ],
        // Add other trusted apps here
    ]);

    /**
     * Check if an app is trusted based on its identifier and origin
     */
    public static isAppTrusted(appId: AppIdentifier, origin: string): boolean
    {
        const trustedApp = this.trustedApps.get(appId);
        if (!trustedApp)
        {
            console.warn(`App ${appId} is not in trusted registry`);
            return false;
        }

        const isTrusted = trustedApp.allowedOrigins.includes(origin);
        if (!isTrusted)
        {
            console.warn(`Origin ${origin} not allowed for app ${appId}`);
            console.warn(`Allowed origins:`, trustedApp.allowedOrigins);
        }

        return isTrusted;
    }

    /**
     * Generate SHA-256 fingerprint for a public key
     * Use this to generate fingerprints for trusted apps
     */
    public static async generateKeyFingerprint(publicKey: CryptoKey): Promise<string>
    {
        try
        {
            const exported = await crypto.subtle.exportKey('jwk', publicKey);
            const keyString = JSON.stringify(exported);
            const encoder = new TextEncoder();
            const data = encoder.encode(keyString);
            const hashBuffer = await crypto.subtle.digest('SHA-256', data);
            const fingerprint = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

            return `sha256:${fingerprint}`;
        } catch (error)
        {
            console.error('Error generating key fingerprint:', error);
            throw error;
        }
    }

    /**
     * Verify public key fingerprint matches expected value
     * Returns true if fingerprint matches or if no fingerprint is configured (permissive mode)
     */
    public static async verifyPublicKeyFingerprint(
        appId: AppIdentifier,
        publicKey: CryptoKey,
        keyType: 'encryption' | 'signing'
    ): Promise<boolean>
    {
        const trustedApp = this.trustedApps.get(appId);
        if (!trustedApp)
        {
            console.error(`App ${appId} not in trusted registry`);
            return false;
        }

        const expectedFingerprint = keyType === 'encryption'
            ? trustedApp.publicKeyFingerprint
            : trustedApp.signingKeyFingerprint;

        // If no fingerprint configured, allow (permissive mode for development)
        if (!expectedFingerprint)
        {
            console.warn(`⚠️ No ${keyType} key fingerprint configured for ${appId} - PERMISSIVE MODE`);
            console.warn(`⚠️ Generate and store fingerprint for production: await TrustedAppRegistry.generateKeyFingerprint(key)`);
            return true;
        }

        try
        {
            const actualFingerprint = await this.generateKeyFingerprint(publicKey);

            if (actualFingerprint !== expectedFingerprint)
            {
                console.error(`❌ Public key fingerprint mismatch for app ${appId} (${keyType})`);
                console.error(`Expected: ${expectedFingerprint}`);
                console.error(`Received: ${actualFingerprint}`);
                console.error(`⚠️ POSSIBLE MITM ATTACK - Key has been substituted!`);
                return false;
            }

            console.log(`✅ ${keyType} key fingerprint verified for ${appId}`);
            return true;
        } catch (error)
        {
            console.error('Error verifying public key fingerprint:', error);
            return false;
        }
    }

    /**
     * Add a new trusted app at runtime (use with caution)
     */
    public static addTrustedApp(appId: AppIdentifier, config: TrustedAppConfig): void
    {
        if (this.trustedApps.has(appId))
        {
            console.warn(`App ${appId} already exists in registry - updating`);
        }
        this.trustedApps.set(appId, config);
    }

    /**
     * Get configuration for a trusted app
     */
    public static getTrustedAppConfig(appId: AppIdentifier): TrustedAppConfig | undefined
    {
        return this.trustedApps.get(appId);
    }

    /**
     * Get list of all trusted app identifiers
     */
    public static getTrustedAppIds(): AppIdentifier[]
    {
        return Array.from(this.trustedApps.keys());
    }

    /**
     * Update fingerprints for an existing trusted app
     * Use this after generating keys for the first time
     */
    public static updateFingerprints(
        appId: AppIdentifier,
        publicKeyFingerprint?: string,
        signingKeyFingerprint?: string
    ): void
    {
        const config = this.trustedApps.get(appId);
        if (!config)
        {
            console.error(`Cannot update fingerprints: App ${appId} not in registry`);
            return;
        }

        if (publicKeyFingerprint)
        {
            config.publicKeyFingerprint = publicKeyFingerprint;
        }
        if (signingKeyFingerprint)
        {
            config.signingKeyFingerprint = signingKeyFingerprint;
        }

        this.trustedApps.set(appId, config);
        console.log(`Updated fingerprints for ${appId}`);
    }
}
