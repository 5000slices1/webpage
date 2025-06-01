import {idlFactory} from '$lib/javascript/Types/Tokens/TrabyterTokenInterface.js';

import {Actor, HttpAgent} from '@dfinity/agent';

//import {CommonTypes} from '../types/CommonTypes.js';

import type {ActorSubclass, ActorMethod} from '@dfinity/agent';

export class TokenActor {
    #actor: ActorSubclass<
        Record<string, ActorMethod<unknown[], unknown>>
    > | null = null;

    constructor() {
        // Add constructor logic here
    }

    async GetActor(
        canisterId: string,
    ): Promise<ActorSubclass<Record<string, ActorMethod<unknown[], unknown>>>> {
        await this.#getActorInternal(canisterId);
        if (this.#actor == null) {
            throw new Error('Actor is not initialized');
        }
        console.log('TokenActor.GetActor: ' + canisterId);
        console.log('TokenActor.GetActor actor:');
        console.log(this.#actor);
        return this.#actor;
    }

    #getActorInternal = async (canisterId: string) => {
        if (this.#actor != null) {
            return this.#actor;
        }

        let isDevelopment = process.env.NODE_ENV == 'development';

        console.log('process.env.NODE_ENV: ' + process.env.NODE_ENV);

        if (isDevelopment) {
            console.log('Using local replica for TokenActor');
            let host = 'http://127.0.0.1:4943';
            await HttpAgent.create({host}).then(async (agent) => {
                await agent.fetchRootKey().catch((err) => {
                    console.warn(
                        'Unable to fetch root key. Check to ensure that your local replica is running',
                    );
                    console.error(err);
                });
                let actor = Actor.createActor(idlFactory, {
                    canisterId: canisterId,
                    agent: agent,
                });
                this.#actor = actor;
            });
        } else {
            console.log('Using production replica for TokenActor');

            let host = 'https://ic0.app';
            try {
                await HttpAgent.create({host})
                    .then((agent) => {
                        try {
                            let actor = Actor.createActor(idlFactory, {
                                canisterId: canisterId,
                                agent: agent,
                            });
                            this.#actor = actor;
                        } catch (err) {
                            console.error(
                                'Error creating actor in production:',
                                err,
                            );
                        }
                    })
                    .catch((err) => {
                        console.error(
                            'Error creating HttpAgent in production:',
                            err,
                        );
                    });
            } catch (err) {
                console.error(
                    'Unexpected error in production TokenActor:',
                    err,
                );
            }
        }
    };
}
