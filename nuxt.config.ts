import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
    app: {
        head: {
            meta: [
                { charset: 'utf-8' },
                { name: 'viewport', content: 'width=device-width, initial-scale=1' }
            ]
        }
    },
    css: [
        "@fortawesome/fontawesome-svg-core/styles.css"
    ],
    buildModules: [
        "@pinia/nuxt"
    ],
    modules: [
        "@nuxtjs/tailwindcss"
    ],
    typescript: {
        shim: false
    },
    vite: {
        css: {
            preprocessorOptions: {
                scss: [
                    "~/assets/main.scss"
                ]
            }
        }
    },
    imports: {
        dirs: [
            'composables',
            'modules/**'
        ]
    },
    runtimeConfig: {
        public: {
            api: {
                baseApi: process.env.WORKSPACE_API
            },
            firebase: {
                apiKey: process.env.FIREBASE_APIKEY,
                authDomain: process.env.FIREBASE_AUTH_DOMAIN,
                projectId: process.env.FIREBASE_PROJECT_ID,
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
                messagingSenderId: process.env.FIREBASE_MESSAGE_SENDER_ID,
                appId: process.env.FIREBAE_APP_ID
            },
            recaptcha: {
                siteKey: process.env.RECAPTCHA_KEY,
                loaderOptions: { autoHideBadge: true },
            }
        }        
    }
})
