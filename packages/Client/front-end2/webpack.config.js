var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    mode: 'development',
    resolve: {
        extensions: ['.js', '.jsx']
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: 'babel-loader'
            },
            { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },
    plugins: [new HtmlWebpackPlugin({
        template: './src/index.html'
    })],
    devServer: {
        historyApiFallback: true
    },
    externals: {
        // global app config object
        config: JSON.stringify({
            user_services_url: 'http://192.168.99.101:30344',
            auth_services_url: 'http://localhost:8181'
            //auth_services_url: 'http://192.168.99.101:31552'
        })
    }
}