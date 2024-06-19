"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultOptions = {
    enable: true,
    mode: "random",
    buildFolderPath: ".next",
    classConversionJsonFolderPath: "./css-obfuscator",
    refreshClassConversionJson: false,
    classLength: 5,
    classPrefix: "",
    classSuffix: "",
    classIgnore: [],
    allowExtensions: [".jsx", ".tsx", ".js", ".ts", ".html", ".rsc"],
    contentIgnoreRegexes: [
        /\.jsxs\)\("\w+"/g,
    ],
    whiteListedFolderPaths: [],
    blackListedFolderPaths: ["./.next/cache"],
    enableMarkers: false,
    markers: ["next-css-obfuscation"],
    removeMarkersAfterObfuscated: true,
    removeOriginalCss: false,
    generatorSeed: "-1",
    enableJsAst: false,
    logLevel: "info",
};
class Config {
    constructor(options) {
        if (!options) {
            this.options = defaultOptions;
            return;
        }
        this.options = Object.assign(Object.assign({}, defaultOptions), options);
    }
    get() {
        return this.options;
    }
}
exports.default = Config;
