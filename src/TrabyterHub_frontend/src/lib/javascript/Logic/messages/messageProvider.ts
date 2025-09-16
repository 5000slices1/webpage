import {MessageRawData} from '$lib/javascript/Abstractions/messages/messageRawData';
//import {browser} from '$app/environment';
import {MessageType} from '$lib/javascript/Abstractions/messages/messagetype';

import {MessageFullScreenRequestMessage} from '../../Abstractions/messages/messageData/FullScreen/messageFullScreenRequestMessage';
import {MainClass} from '../MainClass';

import type {Writable} from 'svelte/store';

export class MessageProvider {
    async Init() {
        window.addEventListener('message', async (event) => await this.MessageReceived(event));
    }

    SendMessageToHost(messageType: MessageType, messageValue: string, id: string | null = null) {
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

            const messageData = MessageRawData.fromString(event.data.data);
            if (messageData.Type === MessageType.FullScreenRequest) {
                var message = MessageFullScreenRequestMessage.fromString<MessageFullScreenRequestMessage>(
                    messageData.Data,
                );

                if (message != null) {
                    let userFullScreen: boolean = message.UseFullScreen;
                    MainClass.update((mc) => {
                        mc.EmbeddedPageFullScreenMode = userFullScreen;
                        return mc;
                    });

                    let embeddedPageFullScreenMode: boolean = false;
                    MainClass.subscribe((mc) => {
                        embeddedPageFullScreenMode = mc.EmbeddedPageFullScreenMode;
                    })();
                    console.log('Full screen mode changed to: ' + embeddedPageFullScreenMode);
                }
            }
        } catch (e) {
            console.error('Error processing received message:', e);
        }
    }
}
