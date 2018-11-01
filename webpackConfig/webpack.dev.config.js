'use strict';

const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const commonConfig = require('../config').common;

module.exports = () => {

    const config = {
        mode: 'development',
        devtool: 'cheap-module-source-map',
        entry: [
            // require.resolve('./polyfills'),
            path.resolve(commonConfig.appDir, 'entry/src/index.js')
        ],
        output: {
            pathinfo: true,
            filename: 'static/js/bundle.js',
            chunkFilename: 'static/js/[name].chunk.js',
            publicPath: '/',
        },
        resolve: {
            modules: ['node_modules', path.resolve(commonConfig.appDir, 'node_modules')],
            extensions: ['.web.js', '.mjs', '.js', '.json', '.web.jsx', '.jsx'],
            alias: {
                // '_'             : 'underscore',
            }
        },
        module: {
            strictExportPresence: true,
            rules: [
                {
                    oneOf: [
                        {
                            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
                            loader: require.resolve('url-loader'),
                            options: {
                                limit: 10000,
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        }, {
                            test: /\.(js|jsx|mjs)$/,
                            include: [path.resolve(commonConfig.appDir, 'entry/src')],
                            use: [
                                {
                                    loader: require.resolve('babel-loader'),
                                    options: {
                                        compact: true,
                                        presets: [
                                            'env',
                                            'react',
                                            'stage-0',
                                        ],
                                        plugins: [
                                        ]
                                    },
                                },
                            ]
                        }, {
                            loader: require.resolve('file-loader'),
                            exclude: [/\.js$/, /\.html$/, /\.json$/],
                            options: {
                                name: 'static/media/[name].[hash:8].[ext]',
                            },
                        },
                    ],
                },
            ],
        },
        plugins: [
            new HtmlWebpackPlugin({
                inject: true,
                template: commonConfig.appHtml,
            }),
            new webpack.HotModuleReplacementPlugin(),
        ],
        node: {
            dgram: 'empty',
            fs: 'empty',
            net: 'empty',
            tls: 'empty',
            child_process: 'empty',
        },
    }

    return config;
}
