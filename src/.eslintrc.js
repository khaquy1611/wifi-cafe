module.exports = {
    env: {
        browser: true,
        es2021: true,
        node: true,
    },
    extends: [
        'plugin:react/recommended',
        'airbnb',
        'plugin:@typescript-eslint/recommended',
        'prettier/@typescript-eslint',
        'plugin:prettier/recommended',
    ],
    parser: '@typescript-eslint/parser',
    parserOptions: {
        ecmaFeatures: {
            jsx: true,
        },
        ecmaVersion: 12,
        sourceType: 'module',
    },
    plugins: ['react', '@typescript-eslint'],
    rules: {
        camelcase: 'off',
        'no-param-reassign': 'off',
        '@typescript-eslint/no-unused-vars': 'error',
        'react/require-default-props': 'off',
        'react/jsx-props-no-spreading': 'off',
        'jsx-a11y/anchor-is-valid': 'off',
        'jsx-a11y/no-static-element-interactions': 'off',
        'jsx-a11y/click-events-have-key-events': 'off',
        'react/jsx-wrap-multilines': 'off',
        'react/jsx-curly-newline': 'off',
        'prettier/prettier': ['error', { endOfLine: 'auto' }],
        'no-underscore-dangle': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        'react/jsx-indent-props': ['error', 4],
        'react/jsx-indent': ['error', 4],
        'no-use-before-define': 'off',
        'no-shadow': 'off',
        'import/no-unresolved': 'off',
        'react/jsx-filename-extension': ['error', { extensions: ['.tsx', '.ts'] }],
        'react/jsx-one-expression-per-line': 'off',
        'import/extensions': [
            'error',
            'ignorePackages',
            {
                ts: 'never',
                tsx: 'never',
            },
        ],
        'no-extra-boolean-cast': 'off',
        'no-nested-ternary': 'off',
    },
    settings: {
        react: {
            version: 'detect',
        },
        'import/resolver': {
            node: {
                extensions: ['.ts', '.tsx'],
            },
        },
    },
    ignorePatterns: ['.next', 'node_modules', 'dist'],
};
