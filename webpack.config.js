const path = require('path')
const UploadWebpackPlugin = require('./src/index.js')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')
const nodeExternals = require('webpack-node-externals')

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'index.js'
    },
    target: "node",
    externals: [nodeExternals()],
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: [['@babel/preset-env', { targets: "defaults" }]], // (> 0.5%, last 2 versions, Firefox ESR, not dead)
                        plugins: ['@babel/plugin-transform-runtime']
                    }
                }
            }
        ]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new UploadWebpackPlugin({
            host: '8.133.238.13',
            port: '22',
            username: 'root',
            privateKey: 'c:/Users/Lenovo/.ssh/id_rsa',
            remotePath: '/var/www/test'
        })
    ]
}