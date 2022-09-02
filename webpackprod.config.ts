import { merge } from "webpack-merge";
import config from "./webpack.config";

export default merge(config, {
    mode: "production",
    devtool: "source-map",
});
