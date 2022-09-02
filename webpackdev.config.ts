import { merge } from "webpack-merge";
import config from "./webpack.config";

export default merge(config, {
    mode: "development",
    devtool: "eval-cheap-module-source-map",
    devServer: {
        open: true,
        port: 22345,
        static: "./dist",
    },
    cache: {
        type: "filesystem",
        allowCollectingMemory: true,
        buildDependencies: {
            config: [__filename],
        },
        compression: "gzip",
        // 缓存30分钟过期
        maxAge: 1000 * 60 * 30,
    },
});
