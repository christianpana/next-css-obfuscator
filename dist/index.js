"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obfuscateCli = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const yargs_1 = tslib_1.__importDefault(require("yargs"));
const utils_1 = require("./utils");
const css_1 = require("./handlers/css");
const config_1 = tslib_1.__importDefault(require("./config"));
function obfuscate(options) {
    (0, utils_1.setLogLevel)(options.logLevel);
    if (!options.enable) {
        (0, utils_1.log)("info", "Obfuscation", "Obfuscation disabled");
        return;
    }
    const classConversionJsonPaths = (0, utils_1.findAllFilesWithExt)(".json", options.classConversionJsonFolderPath);
    if (options.refreshClassConversionJson && classConversionJsonPaths.length > 0) {
        (0, utils_1.log)("info", "Obfuscation", "Refreshing class conversion JSON");
        for (const jsonPath of classConversionJsonPaths) {
            fs_1.default.unlinkSync(jsonPath);
            (0, utils_1.log)("success", "Obfuscation", `Deleted ${jsonPath}`);
        }
    }
    (0, utils_1.log)("info", "Obfuscation", "Creating/Updating class conversion JSON");
    (0, css_1.createSelectorConversionJson)({
        selectorConversionJsonFolderPath: options.classConversionJsonFolderPath,
        buildFolderPath: options.buildFolderPath,
        mode: options.mode,
        classNameLength: options.classLength,
        classPrefix: options.classPrefix,
        classSuffix: options.classSuffix,
        classIgnore: options.classIgnore,
        enableObfuscateMarkerClasses: options.enableMarkers,
        generatorSeed: options.generatorSeed === "-1" ? undefined : options.generatorSeed,
    });
    (0, utils_1.log)("success", "Obfuscation", "Class conversion JSON created/updated");
    if ((options.includeAnyMatchRegexes && options.includeAnyMatchRegexes.length > 0)
        || (options.excludeAnyMatchRegexes && options.excludeAnyMatchRegexes.length > 0)) {
        (0, utils_1.log)("warn", "Obfuscation", "'includeAnyMatchRegexes' and 'excludeAnyMatchRegexes' are deprecated, please use whiteListedFolderPaths and blackListedFolderPaths instead");
    }
    (0, utils_1.replaceJsonKeysInFiles)({
        targetFolder: options.buildFolderPath,
        allowExtensions: options.allowExtensions,
        selectorConversionJsonFolderPath: options.classConversionJsonFolderPath,
        contentIgnoreRegexes: options.contentIgnoreRegexes,
        whiteListedFolderPaths: [...options.whiteListedFolderPaths, ...(options.includeAnyMatchRegexes || [])],
        blackListedFolderPaths: [...options.blackListedFolderPaths, ...(options.excludeAnyMatchRegexes || [])],
        enableObfuscateMarkerClasses: options.enableMarkers,
        obfuscateMarkerClasses: options.markers,
        removeObfuscateMarkerClassesAfterObfuscated: options.removeMarkersAfterObfuscated,
        removeOriginalCss: options.removeOriginalCss,
        enableJsAst: options.enableJsAst,
    });
}
function obfuscateCli() {
    const argv = yargs_1.default.option("config", {
        alias: "c",
        type: "string",
        description: "Path to the config file"
    }).argv;
    let configPath;
    if (argv.config) {
        configPath = path_1.default.resolve(process.cwd(), argv.config);
    }
    else {
        const configFiles = [
            "next-css-obfuscator.config.ts",
            "next-css-obfuscator.config.cjs",
            "next-css-obfuscator.config.mjs",
            "next-css-obfuscator.config.js",
        ];
        for (const file of configFiles) {
            const potentialPath = path_1.default.join(process.cwd(), file);
            if (fs_1.default.existsSync(potentialPath)) {
                configPath = potentialPath;
                break;
            }
        }
    }
    const config = new config_1.default(configPath ? require(configPath) : undefined).get();
    obfuscate(config);
    (0, utils_1.log)("success", "Obfuscation", "Completed~");
}
exports.obfuscateCli = obfuscateCli;
