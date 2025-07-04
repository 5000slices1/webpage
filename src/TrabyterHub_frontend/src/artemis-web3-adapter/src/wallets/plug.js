import {browser} from '$app/environment';

if (browser) {
    if (window && window.ic && window.ic.plug) {
        window.ic.plug.init();
    }

    //console.log('3');
    if (window) {
        if (window.ic?.plug) {
            window.ic.plug.readyState = 'Installed';
        }
        //});
        // window.onload = function () {
        //     console.log('5');
        //     if (window.ic.plug) {
        //         console.log('6');
        //         plug.readyState = 'Installed';
        //     }
        // };
    }
}
export const plug = {
    readyState: 'NotDetected',
    url: 'https://plugwallet.ooo/',
    connectWallet: async function (connectObj = {whitelist: [], host: ''}) {
        if (!window.ic.plug) {
            this.readyState = 'NotDetected';
            window.open('https://plugwallet.ooo/');
        }

        var publicKey = false,
            prinObj = false;
        var isConnected = false;
        const timeoutPromise = new Promise((resolve) => {
            setTimeout(() => {
                resolve(false);
            }, 3000);
        });
        isConnected = await window.ic.plug.isConnected(); //Promise.race([window.ic.plug.isConnected(), timeoutPromise]);
        connectObj.timeout = 50 * 1000;
        try {
            if (isConnected) {
                await window.ic.plug.createAgent(connectObj);
            } else {
                publicKey = await window.ic.plug.requestConnect(connectObj);
            }
            prinObj = await window.ic.plug.agent.getPrincipal();
            this.agent = window.ic.plug.agent;
            this.getPrincipal = async function () {
                return window.ic.plug.getPrincipal();
            };
            this.createActor = async function (t1, t2) {
                return window.ic.plug.createActor(t1, t2);
            };
            this.batchTransactions = async function (
                t1,
                TxStatus = {state: 'init', txList: []},
            ) {
                if (TxStatus && TxStatus.txList > 0) {
                    t1.forEach((x, i) => {
                        t1[i].onSuccess = () => {
                            TxStatus.state = txList[i];
                            x.onSuccess();
                        };
                    });
                }
                return window.ic.plug.batchTransactions(t1);
            };

            return {
                accountId: window.ic.plug.accountId,
                principalId: prinObj.toString(),
            };
        } catch (e) {
            console.error(e);
            throw e;
        }
    },
    disConnectWallet: async function () {
        await window.ic.plug.disconnect();
    },
};
