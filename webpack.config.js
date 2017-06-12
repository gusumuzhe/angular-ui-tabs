/**
 * Created by zhang on 2017/5/26.
 */
var webpack = require('webpack');
var autoprefixer = require('autoprefixer');
var path = require('path');

module.exports = {
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            options: {
                presets: ['env']
            },
            exclude: path.resolve(__dirname, 'node_modules'),
            include: path.resolve(__dirname, 'src')
        }, {
            test: /\.scss$/,
            // loader: 'style-loader!css-loader!postcss-loader!sass-loader',
            use: ['style-loader', { loader: 'css-loader', options: { importLoaders: 1 } }, 'postcss-loader', 'sass-loader']
        }, {
            test: /\.html$/,
            loader: 'html-loader'
        }]
    }
};