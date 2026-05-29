import globals from "globals";
import tslint from "typescript-eslint";
import jslint from "@eslint/js";
import unusedImports from "eslint-plugin-unused-imports";
import appsync from "@aws-appsync/eslint-plugin"

export default tslint.config(
    jslint.configs.recommended,
    appsync.configs.base,
    ...tslint.configs.recommended,
    {
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        plugins: {
            "unused-imports": unusedImports
        },
        files: ["**/*.{js,mjs,cjs,ts.ts}"],
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-empty-function":  "off",
            "@typescript-eslint/no-unused-vars":  "off",
            "@typescript-eslint/ban-types":  "off",
            "@typescript-eslint/no-this-alias":  "off",
            "comma-dangle": "off",
            "new-cap": "warn",
            "no-console": "warn",
            "no-debugger": "warn",
            "no-param-reassign": "warn",
            "no-unused-labels": "off",
            "no-var": "error",
            "prefer-const": "warn",
            "no-trailing-spaces":  "off",
            "eol-last":  "off",
            "spaced-comment": "warn",
            "no-underscore-dangle": "off",
            "no-alert": "warn",
            radix: "error",
            "object-shorthand": [1, "always"],
            "unused-imports/no-unused-imports": "error",
        }
    }
);
