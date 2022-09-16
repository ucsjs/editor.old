import { defineNuxtConfig } from 'nuxt';
import * as path from 'path';
import MonacoWebpackPlugin from "monaco-editor-webpack-plugin";

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
        logLevel: "error",
        define: {
            'process.env.DEBUG': 'false',
        },
        css: {
            preprocessorOptions: {
                scss: [
                    "~/assets/main.scss"
                ]
            }
        }
    },
    vue: {
        compilerOptions: {
            //isCustomElement: (tag) => tag.startsWith('font-awesome-icon'),
            onWarn: (msg) => {
                console.log("onWarn", msg);
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
    },
    build: {
        plugins:[
            new MonacoWebpackPlugin({
                languages: [
                    'javascript', 'python', 'java', 'typescript', 'json',
                    'css', 'html', 'markdown', 'php', 'sql', 'xml', 'yaml',
                    'csharp', 'cpp', 'go', 'rust', 'swift', 'kotlin', 'dart',
                    'powershell', 'fsharp', 'ruby', 'perl', 'lua',
                ],
                features: ["find"],
            })
        ]
    },
    alias:{
        "vscode": "./node_modules/monaco-languageclient/lib/vscode-compatibility"
    },
    hooks: {
        'vite:extend'({ nuxt, config }) {
            config.resolve.alias = {
                ...config.resolve.alias,
                "vscode": path.resolve(__dirname, "./node_modules/monaco-languageclient/lib/vscode-compatibility")
            }
        },
        "webpack:config"(configs) {
            configs[0].resolve.alias = {
                ...configs[0].resolve.alias,
                "vscode": path.resolve(__dirname, "./node_modules/monaco-languageclient/lib/vscode-compatibility")
            }
        }
    }
})
