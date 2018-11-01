'use strict';

const fs = require('fs');
const path = require('path');
const minimist = require('minimist');
const chalk = require('chalk');
const url = require('url');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');

process.env.NODE_ENV = 'development';
// 未知错误时，直接退出处理流程
process.on('unhandledRejection', err => {
    throw err;
});

//定义命令行输入参数
const options = minimist(process.argv);
const HOST = options.host || options.h || 'localhost';
const PORT = options.port || options.p || 9000;
const ENV = options.env || options.e || 'pre';

let config;
if ('prod' === ENV) {
    // 使用线上环境 API
    config = require('../config').production;
} else {
    config = require('../config').preview;
}

const protocol = process.env.HTTPS === 'true' ? 'https' : 'http';
const formatUrl = url.format({ protocol, hostname: HOST, port: PORT, pathname: '/' });

function run() {
    const webpackConfig = require('../webpackConfig/webpack.dev.config')();
    webpackConfig['entry'].unshift(`webpack-dev-server/client?${formatUrl}`, 'webpack/hot/dev-server');
    let webpackCompiler;
    try {
        webpackCompiler = webpack(webpackConfig);
    } catch (err) {
        console.log(chalk.red('Failed to compile.'));
        console.log(chalk.red(err.message || err));
        process.exit(1);
    }
    const devServerConfig = {
        historyApiFallback: true,
        compress: true,
        stats: { colors: true },
        contentBase: path.join(__dirname, 'dist'),
        // 默认情况下，contentBase 里的文件不会触发页面重载
        watchContentBase: false,
        watchOptions: {
            aggregateTimeout: 500,
            poll: 2000,
            ignored: /(node_modules|bower_components)/
        },
        hot: true,
        publicPath: '/',
        before: function(app, server) {
            app.all('/api', function(req, res, next) {
                // 可以检查一下API调用是否是 mock 模式
                console.log('[request] ', req.query, req.body)
                const mock = (req.query && req.query.mock) || (req.body && req.body.mock);
                if(mock) {
                    const action = req.query.action || req.body.action;
                    try {
                        const mockPath = require.resolve(path.join('../mock', action + '.json'));
                        // 用 require 后，存在缓存，改变 mock 文件时不立即生效
                        // res.json(require(mockPath))
                        // 使用 fs 代替
                        fs.readFile(mockPath, 'utf8', (err, data) => {
                            let result;
                            if(err) {
                                result = {
                                    action: action + 'Response',
                                    code: 1,
                                    data: err
                                }
                            } else {
                                try {
                                    result = JSON.parse(data)
                                } catch(err1) {
                                    result = {
                                        action: action + 'Response',
                                        code: 1,
                                        data: err1.toString()
                                    }
                                }
                            }
                            res.json(result);
                        })
                    } catch(err) {
                        res.json({data: err});
                    }
                    // 使用本地 mock 文件
                } else {
                    // 转由 proxy 处理
                    // 改变 host 和 referer
                    req.headers['host'] = config.host;
                    req.headers['referer'] = config.host;
                    next();
                }
            });
        },
        proxy: {
            '/api': {
                target: config.host,
                pathRewrite: { '^/api': '/api' }
            }
        },
        after: function(app, server) {
            // 善后处理些什么东西
        }
    }
    const devServer = new WebpackDevServer(webpackCompiler, devServerConfig);
    // 启动
    devServer.listen(PORT, HOST, err => {
        if (err) {
            throw err;
        }
        console.log(chalk.cyan('Starting the development server...\n'));
        // openBrowser(urls.localUrlForBrowser);
    });
    ['SIGINT', 'SIGTERM'].forEach(function(sig) {
        process.on(sig, function() {
            devServer.close();
            process.exit();
        });
    });
}

run();