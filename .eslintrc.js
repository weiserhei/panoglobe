module.exports = {
    "env": {
        "browser": true,
        "es6": true
    },
    // "extends": "eslint:recommended",
    "extends": "airbnb-base/legacy",
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018,
        "sourceType": "module"
    },
    "rules": {
        "comma-dangle": ["error", "always-multiline"],
        "linebreak-style": ["off", "unix"],
        "max-len": [2, 100, 4, { "ignoreComments": true, "ignoreStrings": true, "ignoreRegExpLiterals": true }],
        "no-multi-str": ["warn"]
        // "semi": ["warn", "always"],
        // "no-console": ["off", "always"],
    },
};