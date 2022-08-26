/* eslint-disable */
const { withPlugins } = require('next-compose-plugins');
const withLess = require('@zeit/next-less');
const lessToJS = require('less-vars-to-js');
const withSass = require('@zeit/next-sass');
const FilterWarningsPlugin = require('webpack-filter-warnings-plugin');
const fs = require('fs');
const path = require('path');
const Dotenv = require('dotenv-webpack');

const themeVariables = lessToJS(fs.readFileSync(path.resolve(__dirname, './assets/antd-custom.less'), 'utf8'));

const withCSS = withSass({
    poweredByHeader: false,
    cssModules: true,
    ...withLess({
        lessLoaderOptions: {
            javascriptEnabled: true,
            modifyVars: themeVariables, // make your antd custom effective
            importLoaders: 0,
        },
        cssLoaderOptions: {
            importLoaders: 3,
            localIdentName: '[local]___[hash:base64:5]',
        },
        webpack: (config, { isServer }) => {
            //Make Ant styles work with less
            if (isServer) {
                const antStyles = /antd\/.*?\/style.*?/;
                const origExternals = [...config.externals];
                config.externals = [
                    (context, request, callback) => {
                        if (request.match(antStyles)) return callback();
                        if (typeof origExternals[0] === 'function') {
                            origExternals[0](context, request, callback);
                        } else {
                            callback();
                        }
                    },
                    ...(typeof origExternals[0] === 'function' ? [] : origExternals),
                ];

                config.module.rules.unshift({
                    test: antStyles,
                    use: 'null-loader',
                });
            }
            config.plugins.push(
                new FilterWarningsPlugin({
                    exclude: /mini-css-extract-plugin[^]*Conflicting order between:/,
                }),
            );
            config.plugins = [
                ...config.plugins,
                // Read the .env file
                new Dotenv({
                    path: path.join(__dirname, '.env'),
                    systemvars: true,
                }),
            ];
            return config;
        },
    }),
});

const nextConfig = {
    images: {
        domains: ['s3.kstorage.vn', 'qrpayment.s3.kstorage.vn'],
    },
};

module.exports = withPlugins([[withCSS]], nextConfig);

// module.exports = withLess({
//     cssModules: true,
//     lessLoaderOptions: {
//         javascriptEnabled: true,
//         modifyVars: themeVariables, // make your antd custom effective
//         importLoaders: 0,
//     },
//     // experimental: {
//     //     css: true,
//     // },
//     cssLoaderOptions: {
//         importLoaders: 3,
//         localIdentName: '[local]___[hash:base64:5]',
//     },
//     webpack: (config, { isServer }) => {
//         const configS = config;
//         if (isServer) {
//             const antStyles = /antd\/.*?\/style.*?/;
//             const origExternals = [...config.externals];
//             configS.externals = [
//                 // eslint-disable-next-line consistent-return
//                 (context, request, callback) => {
//                     if (request.match(antStyles)) {
//                         return callback();
//                     }
//                     if (typeof origExternals[0] === 'function') {
//                         origExternals[0](context, request, callback);
//                     } else {
//                         callback();
//                     }
//                 },
//                 ...(typeof origExternals[0] === 'function' ? [] : origExternals),
//             ];

//             config.module.rules.unshift({
//                 test: antStyles,
//                 use: 'null-loader',
//             });
//         }
//         configS.plugins = [
//             ...config.plugins,
//             // Read the .env file
//             new Dotenv({
//                 path: path.join(__dirname, '.env'),
//                 systemvars: true,
//             }),
//         ];

//         return config;
//     },
// });
