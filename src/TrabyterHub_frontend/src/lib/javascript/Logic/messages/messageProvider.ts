import
    {
        AllowedOriginUrls,
        AppIdentifierToUrl,
    } from '$lib/javascript/Abstractions/constants/globalConstants';
import { RequestFullScreenMessage } from '$lib/shared/common/abstractions/messages/FromEmbeddedApp/requestFullScreenMessage';
import { MessageRawData } from '$lib/shared/common/abstractions/messages/messageRawData';
import { MessageType } from '$lib/shared/common/abstractions/messages/messagetype';
import { AppIdentifier } from '$lib/shared/common/abstractions/types/commonTypes';
import { CommonMessageProvider } from '$lib/shared/common/logic/commonMessageProvider';

import { Bool } from '@dfinity/candid/lib/cjs/idl';

import { MainClass } from '../MainClass';

import type { IMessageProvider } from '$lib/shared/common/logic/commonMessageProvider';

import type { Writable } from 'svelte/store';
export class MessageProvider extends CommonMessageProvider implements IMessageProvider
{
    constructor(myAppIdentifier: AppIdentifier)
    {
        super(myAppIdentifier, AllowedOriginUrls, AppIdentifierToUrl);
    }

    async InitAsync()
    {
        await super.InitAsync();
        await this.SendPublicKeyResponse(AppIdentifier.TrabyterStaking);
        await this.SendPublicKeyRequest(AppIdentifier.TrabyterStaking);

    }

    public async MessageReceived(
        targetIdentifier: AppIdentifier,
        sourceIdentifier: AppIdentifier,
        messageType: MessageType,
        messageDataAsJsonString: string,

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
            }
        } catch (e)
        {
            console.error('Error processing received message:', e);
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
