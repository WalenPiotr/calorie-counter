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
        publicPath: "/"
    },
    devtool: "source-map",
    resolve: {
        extensions: [".js", ".json", ".ts", ".tsx", ".d.ts"],
        alias: {
            "@interfaces": path.resolve(__dirname, "src/interfaces/"),
            "@containers": path.resolve(__dirname, "src/containers/"),
            "@components": path.resolve(__dirname, "src/components/"),
            "@elements": path.resolve(__dirname, "src/elements/"),
            "@media": path.resolve(__dirname, "src/media.ts"),
            "@storage": path.resolve(__dirname, "src/storage.ts"),
            "@status": path.resolve(__dirname, "src/status.ts"),
            "@requests": path.resolve(__dirname, "src/requests.ts"),
            "@routes": path.resolve(__dirname, "src/routes.ts"),
            "@theme": path.resolve(__dirname, "src/theme.ts"),
            "@reducers": path.resolve(__dirname, "src/reducers/"),
            "@actions": path.resolve(__dirname, "src/actions/")
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: "awesome-typescript-loader",
                options: {
                    getCustomTransformers: () => ({
                        before: [styledComponentsTransformer]
                    })
                }
            },
            {
                test: /\.css$/,
                use: [
                    {
                        loader: "style-loader"
                    },
                    {
                        loader: "css-loader"
                    }
                ]
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: "html-loader"
                    }
                ]
            },
            {
                test: /\.(ico)$/,
                use: [
                    {
                        loader: "file-loader",
                        options: {
                            name: "[name].[ext]"
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new HtmlWebPackPlugin({
            template: "./public/index.html",
            filename: "./index.html"
        })
    ],
    devServer: {
        proxy: {
            "/api": "http://localhost:8080"
        },
        historyApiFallback: true
    }
};
