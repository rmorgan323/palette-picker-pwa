module.exports = {
    "env": {
        "browser": true,
        "es6": true,
        "node": true,
        "mocha": true,
        "jquery": true
    },
    "extends": "eslint:recommended",
    "parserOptions": {
        "ecmaFeatures": {
            "experimentalObjectRestSpread": true,
            "arrowFunctions": true,
            "defaultParameters": true,
            "destructuring": true
        },
        "ecmaVersion": 8,
        "sourceType": "module"
    },
    "rules": {
        "eqeqeq": [
            "error", 
            "always"
        ],
        "indent": [
            "error",
            2
        ],
        "newline-after-var": [ 
            "error", 
            "always" 
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    },
    "globals": {
        "expect": true
    }
};