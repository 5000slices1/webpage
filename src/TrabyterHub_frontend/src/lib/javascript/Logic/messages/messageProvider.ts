import {RequestFullScreenMessage} from '$lib/shared/common/abstractions/messages/FromEmbeddedApp/requestFullScreenMessage';
import {MessageRawData} from '$lib/shared/common/abstractions/messages/messageRawData';
//import {browser} from '$app/environment';
import {MessageType} from '$lib/shared/common/abstractions/messages/messagetype';

import {MainClass} from '../MainClass';

import type {Writable} from 'svelte/store';

export class MessageProvider {
    async Init() {
        window.addEventListener('message', async (event) => await this.MessageReceived(event));
    }

    SendMessageToHostNoEnryption(messageType: MessageType, messageValue: string, id: string | null = null) {
        try {
            var messageData = new MessageRawData(messageType, messageValue, id);

            // Send a message to the parent
            window.parent.postMessage({type: messageType, data: messageData.toString}, '*');
        } catch (e) {
            console.error('Error sending message to host:', e);
        }
    }

    async MessageReceived(event: MessageEvent) {
        try {
            // Validate the origin of the message
            // if (event.origin !== window.origin) {
            //     console.warn('Received message from unknown origin:', event.origin);
            //     return;
            // }
            // if (event.data.type === 'REQUEST_DATA') {
            //     // Respond with custom data
            //     event.source.postMessage({ type: 'RESPONSE_DATA', requestId: event.data.requestId, payload: 'your data' }, event.origin);
            // }

            const messageData: MessageRawData = MessageRawData.fromString(event.data.data);
            console.log('Parsed MessageData:');
            console.log(messageData);
            if (messageData.Type === MessageType.FullScreenRequest) {
                //var internalJsonString: string = await messageData.GetInternalDataStringAsync();
                //console.log('Decrypted internal JSON string:', internalJsonString);

                await this.handleFullScreenRequest(messageData);
            }
        } catch (e) {
            console.error('Error processing received message:', e);
        }
    }

    private async handleFullScreenRequest(messageData: MessageRawData) {
        let internalJsonString: string = await messageData.GetInternalDataStringAsync();
        console.log('Decrypted internal JSON string:', internalJsonString);
        var message: RequestFullScreenMessage | null =
            RequestFullScreenMessage.fromString<RequestFullScreenMessage>(internalJsonString);

        console.log('Website: Parsed FullScreenRequest MessageData:', message);
        if (message != null) {
            // Defensive: if message is still a string, try parsing again
            if (typeof message === 'string') {
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    message = JSON.parse(message as any) as RequestFullScreenMessage;
                } catch (e) {
                    console.error('Failed to parse nested FullScreenRequest JSON:', e);
                    message = null;
                }
            }

            if (message == null) {
                console.warn('FullScreenRequest message is null after parsing; aborting.');
            } else {
                const userFullScreen: boolean = (message as any).UseFullScreen;

                console.log('Website: Full screen request received. New full screen mode: ' + userFullScreen);
                MainClass.update((mc) => {
                    mc.EmbeddedPageFullScreenMode = userFullScreen;
                    return mc;
                });

                //check the new value
                let embeddedPageFullScreenMode: boolean = false;
                MainClass.subscribe((mc) => {
                    embeddedPageFullScreenMode = mc.EmbeddedPageFullScreenMode;
                })();
                console.log('Full screen mode changed to: ' + embeddedPageFullScreenMode);
            }
        }
    }
}
