// import * as security from '@aerogear/security';
// import * as auth from '@aerogear/auth';
import * as app from '@aerogear/app';
// import * as sync from '@aerogear/voyager-client';
// import * as push from '@aerogear/push';

// @ts-ignore
window.require = (module: string) => {
    switch(module) {
        case "@aerogear/app":
            return app;
    }
    throw new Error(`module ${module} not found`);
};