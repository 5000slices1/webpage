// This file is for subscribing and publishing events

export const PubSub = (() => {
    const events: {[key: string]: {token: string; func: Function}[]} = {};

    function publish(event: string, data: any) {
        if (!events[event]) {
            return false;
        }

        const subscribers = events[event];
        subscribers.forEach((subscriber) => {
            subscriber.func(event, data);
        });
        return true;
    }

    function subscribe(
        subscriber_identifier: string | number,
        event: string,
        func: Function,
    ) {
        if (!events[event]) {
            events[event] = [];
        }

        const token = subscriber_identifier.toString();
        events[event].push({
            token,
            func,
        });
        return token;
    }

    function unsubscribe(subscriber_identifier: string | number) {
        Object.keys(events).some((event) =>
            events[event].some((subscriber, index) => {
                const areEqual =
                    subscriber?.token === subscriber_identifier.toString();
                if (areEqual) {
                    events[event].splice(index, 1);
                }
                return areEqual;
            }),
        );

        // return found ? token : null;
    }

    return {
        publish,
        subscribe,
        unsubscribe,
    };
})();
