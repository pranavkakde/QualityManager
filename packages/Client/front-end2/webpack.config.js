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
            geteway_services_url: 'http://localhost:10104/api',
            user_services_url: 'http://localhost:10104/api/user',
            auth_services_url: 'http://localhost:10104/api/auth',
            ts_services_url: 'http://localhost:10104/api/testsuite',
            project_services_url: 'http://localhost:7782'
        })
    }
}