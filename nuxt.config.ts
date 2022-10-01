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
    meta: {
        title: "UCS",
        script: [
            { src: "https://cdn.jsdelivr.net/npm/leader-line-new@1.1.9/leader-line.min.js" },
            { src: "https://cdnjs.cloudflare.com/ajax/libs/rxjs/7.5.6/rxjs.umd.min.js" }, 
            { src: 'https://unpkg.com/flowbite@1.4.5/dist/flowbite.js' },
            { src: "node_modules/xterm/lib/xterm.js" },
            { src: "node_modules/xterm-addon-web-links/lib/xterm-addon-web-links.js" }, 
            { src: "node_modules/ejs/ejs.min.js" }, 
        ],
        link: [
            { rel: "stylesheet", href: "https://unpkg.com/flowbite@1.4.5/dist/flowbite.min.css" },
            { rel: "stylesheet", href: "node_modules/xterm/css/xterm.css" },
            { rel: "stylesheet", href: "node_modules/vue3-draggable-resizable/dist/Vue3DraggableResizable.css" }
        ]
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
        logLevel: 'silent',
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
        "vscode": "./node_modules/monaco-languageclient/lib/vscode-compatibility",
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
        },
        'components:dirs'(dirs) {
            dirs.push({
              path: path.join(__dirname, 'components'),
              prefix: 'awesome'
            })
        }
    }
})
