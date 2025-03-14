module.exports = {
    env: {
        browser: true,
        es2021: true,
        jest: true
    },
    extends: [
        "prettier",
        "eslint:recommended",
        "plugin:prettier/recommended",
        "plugin:import/errors",
        "plugin:import/warnings",
        "plugin:import/typescript",
        "plugin:@typescript-eslint/recommended"
    ],
    parser: "@typescript-eslint/parser",
    plugins: [
        "@typescript-eslint",
        "import",
        "unused-imports",
        "lean-imports"
    ],
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: ["tsconfig.json"]
    },
    rules: {
        "@typescript-eslint/no-explicit-any": 0,
        "@typescript-eslint/no-var-requires": 0,
        "@typescript-eslint/no-empty-function": 0,
        "@typescript-eslint/no-unused-vars": 0,
        "@typescript-eslint/ban-types": 0,
        "@typescript-eslint/no-this-alias": 0,
        "comma-dangle": 0,
        "new-cap": "warn",
        "no-console": "off",
        "no-debugger": "warn",
        "no-param-reassign": "warn",
        "no-unused-labels": "off",
        "no-var": "error",
        "prefer-const": "warn",
        "no-trailing-spaces": 0,
        "eol-last": 0,
        "spaced-comment": "warn",
        "no-underscore-dangle": 0,
        "no-alert": "warn",
        radix: "error",
        "object-shorthand": [1, "always"],
        "unused-imports/no-unused-imports": "error",
    },
    settings: {
        "import/resolver": {
            "node": {
                "extensions": [".js", ".ts"],
                "moduleDirectory": ["node_modules", "src/"],
            },
            "typescript": {
                alwaysTryTypes: true,
            }
        }
    }
};
