module.exports = {
    root: true,
    env: {
        node: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
        parser: 'espree', 
        ecmaVersion: 2022,
        sourceType: 'module'
    },
    extends: [
      'plugin:vue/vue3-essential',
    ],
    rules: {
        "vue/no-v-model-argument": "off",
    }
}