
import { RequestWalletStatusMessage } from '$lib/shared/common/abstractions/messages/fromAny/RequestWalletStatusMessage';
import { ResponseWalletStatusMessage } from '$lib/shared/common/abstractions/messages/fromAny/ResponseWalletStatusMessage';
import { RequestFullScreenMessage } from '$lib/shared/common/abstractions/messages/FromEmbeddedApp/requestFullScreenMessage';
import { MessageRawData } from '$lib/shared/common/abstractions/messages/messageRawData';
import { MessageType } from '$lib/shared/common/abstractions/messages/messagetype';
import { AppIdentifier } from '$lib/shared/common/abstractions/types/commonTypes';
import { CommonMessageProvider } from '$lib/shared/common/logic/commonMessageProvider';
import
    {
        AllowedOriginUrls,
        AppIdentifierToUrl,
    } from '$lib/shared/common/security/trustedAppRegistry.js';

import { Bool } from '@dfinity/candid/lib/cjs/idl';

import { ModelIdentityProvider } from '../../Abstractions/Identity/ModelIdentityProvider';
import { MainClass } from '../MainClass';

import type { IMessageProvider } from '$lib/shared/common/logic/commonMessageProvider';

import type { Writable } from 'svelte/store';
import type { IdentityProvider } from '../identity/IdentityProvider';

export class MessageProvider extends CommonMessageProvider implements IMessageProvider
{
    constructor(myAppIdentifier: AppIdentifier)
    {
        super(myAppIdentifier, AllowedOriginUrls, AppIdentifierToUrl);
    }

    async InitAsync()
    {
        await super.InitAsync();
        // Don't proactively request child's key - child will initiate when iframe loads
        // Parent will automatically respond when it receives the child's request
    }

    public async MessageReceived(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageDataAsJsonString: string,
        messageId: string | null

    ): Promise<void>
    {
        try
        {
            console.log('sourceIdentifier:', sourceIdentifier);
            console.log('targetIdentifier:', targetIdentifier);

            if (targetIdentifier !== this.MyAppIdentifier)
            {
                return;
            }

            console.log('MessageData as json string:');
            console.log(messageDataAsJsonString);
            if (messageType === MessageType.FullScreenRequest)
            {
                var message: RequestFullScreenMessage | null =
                    RequestFullScreenMessage.fromString<RequestFullScreenMessage>(messageDataAsJsonString);
                console.log('Parsed FullScreenRequest MessageData:', message);

                if (message == null)
                {
                    console.warn('FullScreenRequest message is null; aborting.');
                    return;
                }
                const useFullSCreen: boolean = (message as RequestFullScreenMessage)?.UseFullScreen;
                console.log('fullscreen: ', (message as RequestFullScreenMessage)?.UseFullScreen);

                await this.handleFullScreenRequest(useFullSCreen);
            } else if (messageType === MessageType.RequestWalletStatus)
            {
                console.log('Received RequestWalletStatus message');

                var requestMessage: RequestWalletStatusMessage | null =
                    RequestWalletStatusMessage.fromString<RequestWalletStatusMessage>(messageDataAsJsonString);

                if (requestMessage == null)
                {
                    console.warn('RequestWalletStatus message is null; aborting.');
                    return;
                }

                await this.SendUsersIdentityAsync(sourceIdentifier);

            }
        } catch (e)
        {
            console.error('Error processing received message:', e);
        }
    }

    public async SendUsersIdentityAsyncToAllConnectedAppsAsync(): Promise<void>
    {
        // Iterate over all registered app identifiers
        for (const appId of Object.keys(AppIdentifierToUrl) as AppIdentifier[])
        {
            // Skip sending to ourselves
            if (appId !== this.MyAppIdentifier)
            {
                console.log('Sending user identity to app:', appId);
                await this.SendUsersIdentityAsync(appId);
            }
        }
    }

    public async SendUsersIdentityAsync(targetIdentifier: AppIdentifier): Promise<void>
    {
        let identityProvider: IdentityProvider | undefined;
        MainClass.subscribe((mc) =>
        {
            identityProvider = mc.IdentityProvider;
        })();

        console.log('Preparing to send user identity to:', targetIdentifier);
        if (identityProvider)
        {
            var ModelIdentityProvider = identityProvider.GetModelUsersIdentity();
            var responseWalletMessage: ResponseWalletStatusMessage = new ResponseWalletStatusMessage();
            responseWalletMessage.IsConnected = ModelIdentityProvider.IsConnected;
            responseWalletMessage.PrincipalText = ModelIdentityProvider.AccountPrincipalText;
            responseWalletMessage.AccountId = ModelIdentityProvider.AccountId;
            responseWalletMessage.TimeStamp = Date.now();
            console.log('IdentityProvider:', identityProvider);

            var messageId: string | null = null;
            console.log('Sending ResponseWalletStatus message with ID:', messageId);
            await this.PostMessage(targetIdentifier, this.MyAppIdentifier, MessageType.ResponseWalletStatus,
                responseWalletMessage, true, messageId);


        } else
        {
            console.warn('IdentityProvider is undefined.');
        }
    }

    private async handleFullScreenRequest(fullScreen: boolean)
    {
        console.log('Website: Full screen request received. New full screen mode: ' + fullScreen);
        MainClass.update((mc) =>
        {
            mc.EmbeddedPageFullScreenMode = fullScreen;
            return mc;
        });

        //check the new value
        let embeddedPageFullScreenMode: boolean = false;
        MainClass.subscribe((mc) =>
        {
            embeddedPageFullScreenMode = mc.EmbeddedPageFullScreenMode;
        })();

        console.log('Full screen mode changed to: ' + embeddedPageFullScreenMode);
    }
}
