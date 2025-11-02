import {RequestFullScreenMessage} from '$lib/shared/common/abstractions/messages/FromEmbeddedApp/requestFullScreenMessage';
import {MessageRawData} from '$lib/shared/common/abstractions/messages/messageRawData';
//import {browser} from '$app/environment';
import {MessageType} from '$lib/shared/common/abstractions/messages/messagetype';

import {CryptoUtils} from '../crypto/cryptoutils';

export class CommonMessageProvider {
    /// Sends a message to the parent window without using encryption
    PostMessageToParent<T>(messageType: MessageType, messageData: T, id: string | null = null, senderId?: string) {
        try {
            var messageAsString: string = JSON.stringify(messageData);
            var messageRawData: MessageRawData = new MessageRawData(messageType, messageAsString, id, senderId);

            // Send a message to the parent
            //console.log('MessageProvider.SendMessageToHost', messageType, messageData);
            //var messageDataString: string = messageData.toString();
            //console.log('MessageProvider.SendMessageToHost string:', messageType, messageDataString);

            window.parent.postMessage({type: messageType, data: messageRawData.toString()}, '*');
        } catch (e) {
            console.error('Error sending message to host:', e);
        }
    }

    // PostMessageEncryptedToParent<T>(messageType: MessageType, messageData: T, id: string | null = null) {
    //     try {
    //         var messageRawData: MessageRawData = CryptoUtils.EncryptAndReturnAsRawMessageAsync(
    //             messageData,
    //             messageType,
    //             id,
    //         );

    //         window.parent.postMessage({type: messageType, data: messageRawData.toString()}, '*');
    //     } catch (e) {
    //         console.error('Error sending message to host:', e);
    //     }
    // }
}
