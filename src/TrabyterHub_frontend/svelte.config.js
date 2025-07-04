import adapter from '@sveltejs/adapter-static';
import {sveltePreprocess} from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: sveltePreprocess(),
    kit: {
        // adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
        // If your environment is not supported or you settled on a specific environment, switch out the adapter.
        // See https://kit.svelte.dev/docs/adapters for more information about adapters.
        adapter: adapter({
            pages: 'dist',
            assets: 'dist',
            fallback: undefined,
            precompress: true,
            strict: true,
        }),
    },
    // compilerOptions: {
    //     runes: true, // Enable rune support for Svelte components
    // },
};

export default config;
