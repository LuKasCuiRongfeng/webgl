import { resolve } from "path";
import { Configuration as WebpackConfiguration, ProgressPlugin } from "webpack";
import { Configuration as WebpackDevServerConfiguration } from "webpack-dev-server";
import HtmlWebpackPlugin from "html-webpack-plugin";

interface Configuration extends WebpackConfiguration {
    devServer?: WebpackDevServerConfiguration;
}

const config: Configuration = {
    entry: "./src/main.tsx",
    output: {
        path: resolve(__dirname, "dist"),
        filename: "[name].js",
        clean: true,
        pathinfo: false,
    },
    optimization: {
        moduleIds: "deterministic",
        runtimeChunk: "single",
        splitChunks: {
            chunks: "all",
        },
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        alias: {
            "@": resolve(__dirname, "src"),
        },
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ["style-loader", "css-loader"],
            },
            {
                test: /\.less$/i,
                use: ["style-loader", "css-loader", "less-loader"],
            },
            {
                test: /\.(png|jpg|jpeg|gif|svg)$/i,
                include: resolve(__dirname, "src/assets"),
                type: "asset/resource",
            },
            {
                test: /\.(ts|js)x?$/i,
                include: resolve(__dirname, "src"),
                use: [
                    {
                        loader: "babel-loader",
                        options: {
                            presets: [
                                ["@babel/preset-typescript"],
                                ["@babel/preset-react"],
                            ],
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: resolve(__dirname, "src/index.html"),
        }),
        new ProgressPlugin(),
    ],
};

export default config;
