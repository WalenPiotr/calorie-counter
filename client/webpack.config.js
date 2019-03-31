const path = require("path");
const createStyledComponentsTransformer = require("typescript-plugin-styled-components")
    .default;
const styledComponentsTransformer = createStyledComponentsTransformer();
const HtmlWebPackPlugin = require("html-webpack-plugin");

module.exports = {
    entry: path.resolve(__dirname, "src/index.tsx"),
    output: {
        filename: "[name].bundle.js",
        path: path.resolve(__dirname, "dist"),
        publicPath: "/",
    },
    devtool: "source-map",
    resolve: {
        extensions: [".js", ".json", ".ts", ".tsx", ".d.ts"],
        alias: {
            "@interfaces": path.resolve(__dirname, "src/interfaces/"),
            "@views": path.resolve(__dirname, "src/views/"),
            "@components": path.resolve(__dirname, "src/components/"),
            "@elements": path.resolve(__dirname, "src/elements/"),
            "@media": path.resolve(__dirname, "src/media.ts"),
            "@storage": path.resolve(__dirname, "src/storage.ts"),
            "@status": path.resolve(__dirname, "src/status.ts"),
            "@requests": path.resolve(__dirname, "src/requests.ts"),
            "@theme": path.resolve(__dirname, "src/theme.ts"),
            "@inputValidation": path.resolve(
                __dirname,
                "src/inputValidation.ts",
            ),
        },
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    getCustomTransformers: () => ({
                        before: [styledComponentsTransformer],
                    }),
                },
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader",
                    },
                    {
                        loader: "css-loader",
                    },
                ],
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader",
                    },
                ],
            },
            {
                test: /\.(ico)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]",
                        },
                    },
                ],
            },
        ],
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html",
        }),
    ],
    devServer: {
        proxy: {
            "/*.*-*": {
                // Match all URL's with period/dot
                target: "http://localhost:8080/", // send to webpack dev server
                rewrite: function(req) {
                    req.url = "index.html"; // Send to react app
                },
            },
        },
        historyApiFallback: {
            disableDotRule: true,
        },
    },
};
