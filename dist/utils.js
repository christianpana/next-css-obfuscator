"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.simplifyString = exports.decodeKey = exports.createKey = exports.duplicationCheck = exports.addKeysToRegistery = exports.findClosestSymbolPosition = exports.obfuscateKeys = exports.usedKeyRegistery = exports.seedableSimplifyString = exports.getRandomString = exports.findAllFilesWithExt = exports.replaceFirstMatch = exports.findContentBetweenMarker = exports.setLogLevel = exports.replaceJsonKeysInFiles = exports.loadAndMergeJsonFiles = exports.normalizePath = exports.log = exports.getFilenameFromPath = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const recoverable_random_1 = tslib_1.__importDefault(require("recoverable-random"));
const css_1 = require("./handlers/css");
const html_1 = require("./handlers/html");
const js_1 = require("./handlers/js");
const issuer = "[next-css-obfuscator]";
let logLevel = "info";
const levels = ["debug", "info", "warn", "error", "success"];
function log(type, task, data) {
    if (levels.indexOf(type) < levels.indexOf(logLevel)) {
        return;
    }
    const mainColor = "\x1b[38;2;99;102;241m%s\x1b[0m";
    switch (type) {
        case "debug":
            console.debug(mainColor, issuer, "[Debug] \x1b[37m", task, data, "\x1b[0m");
            break;
        case "info":
            console.info(mainColor, issuer, "🗯️ \x1b[36m", task, data, "\x1b[0m");
            break;
        case "warn":
            console.warn(mainColor, issuer, "⚠️ \x1b[33m", task, data, "\x1b[0m");
            break;
        case "error":
            console.error(mainColor, issuer, "⛔ \x1b[31m", task, data, "\x1b[0m");
            break;
        case "success":
            console.log(mainColor, issuer, "✅ \x1b[32m", task, data, "\x1b[0m");
            break;
        default:
            console.log("'\x1b[0m'", issuer, task, data, "\x1b[0m");
            break;
    }
}
exports.log = log;
function setLogLevel(level) {
    logLevel = level;
}
exports.setLogLevel = setLogLevel;
const usedKeyRegistery = new Set();
exports.usedKeyRegistery = usedKeyRegistery;
function replaceJsonKeysInFiles({ targetFolder, allowExtensions, selectorConversionJsonFolderPath, contentIgnoreRegexes, whiteListedFolderPaths, blackListedFolderPaths, enableObfuscateMarkerClasses, obfuscateMarkerClasses, removeObfuscateMarkerClassesAfterObfuscated, removeOriginalCss, enableJsAst, }) {
    const classConversion = loadAndMergeJsonFiles(selectorConversionJsonFolderPath);
    if (removeObfuscateMarkerClassesAfterObfuscated) {
        obfuscateMarkerClasses.forEach(obfuscateMarkerClass => {
            classConversion[`.${obfuscateMarkerClass}`] = "";
        });
    }
    const cssPaths = [];
    const replaceJsonKeysInFile = (filePath) => {
        const fileExt = path_1.default.extname(filePath).toLowerCase();
        if (fs_1.default.statSync(filePath).isDirectory()) {
            fs_1.default.readdirSync(filePath).forEach((subFilePath) => {
                replaceJsonKeysInFile(path_1.default.join(filePath, subFilePath));
            });
        }
        else if (allowExtensions.includes(fileExt)) {
            let isTargetFile = true;
            if (whiteListedFolderPaths.length > 0) {
                isTargetFile = whiteListedFolderPaths.some((incloudPath) => {
                    if (typeof incloudPath === "string") {
                        return normalizePath(filePath).includes(incloudPath);
                    }
                    const regex = new RegExp(incloudPath);
                    return regex.test(normalizePath(filePath));
                });
            }
            if (blackListedFolderPaths.length > 0) {
                const res = !blackListedFolderPaths.some((incloudPath) => {
                    if (typeof incloudPath === "string") {
                        return normalizePath(filePath).includes(incloudPath);
                    }
                    const regex = new RegExp(incloudPath);
                    return regex.test(normalizePath(filePath));
                });
                if (!res) {
                    isTargetFile = false;
                }
            }
            if (!isTargetFile) {
                return;
            }
            let fileContent = fs_1.default.readFileSync(filePath, "utf-8");
            const fileContentOriginal = fileContent;
            if (enableObfuscateMarkerClasses) {
                obfuscateMarkerClasses.forEach(obfuscateMarkerClass => {
                    const isHtml = [".html"].includes(fileExt);
                    if (isHtml) {
                        const htmlRegex = new RegExp(`(<(.*)>(.*)<\/([^br][A-Za-z0-9]+)>)`, 'g');
                        const htmlMatch = fileContent.match(htmlRegex);
                        if (htmlMatch) {
                            const htmlOriginal = htmlMatch[0];
                            const { obfuscatedContent, usedKeys } = (0, html_1.obfuscateHtmlClassNames)({
                                html: htmlOriginal,
                                selectorConversion: classConversion,
                                obfuscateMarkerClass: obfuscateMarkerClass,
                                contentIgnoreRegexes: contentIgnoreRegexes,
                            });
                            addKeysToRegistery(usedKeys);
                            if (htmlOriginal !== obfuscatedContent) {
                                fileContent = fileContent.replace(htmlOriginal, obfuscatedContent);
                            }
                        }
                    }
                    else {
                        const obfuscateScriptContent = (0, js_1.obfuscateJs)(fileContent, obfuscateMarkerClass, classConversion, filePath, contentIgnoreRegexes, enableJsAst);
                        if (fileContent !== obfuscateScriptContent) {
                            fileContent = obfuscateScriptContent;
                            log("debug", `Obscured keys in JS like content file:`, normalizePath(filePath));
                        }
                    }
                });
            }
            else {
                if ([".js"].includes(fileExt)) {
                    const obfuscateScriptContent = (0, js_1.obfuscateJs)(fileContent, enableJsAst ? "" : "jsx", classConversion, filePath, contentIgnoreRegexes, enableJsAst);
                    if (fileContent !== obfuscateScriptContent) {
                        fileContent = obfuscateScriptContent;
                        log("debug", `Obscured keys in JSX related file:`, normalizePath(filePath));
                    }
                }
                else if ([".html"].includes(fileExt)) {
                    const { obfuscatedContent, usedKeys } = (0, html_1.obfuscateHtmlClassNames)({
                        html: fileContent,
                        selectorConversion: classConversion,
                        contentIgnoreRegexes: contentIgnoreRegexes,
                    });
                    fileContent = obfuscatedContent;
                    addKeysToRegistery(usedKeys);
                }
                else {
                    const { obfuscatedContent, usedKeys } = obfuscateKeys(classConversion, fileContent, contentIgnoreRegexes);
                    fileContent = obfuscatedContent;
                    addKeysToRegistery(usedKeys);
                }
            }
            if (fileContentOriginal !== fileContent) {
                log("success", "Data obfuscated:", normalizePath(filePath));
                fs_1.default.writeFileSync(filePath, fileContent);
            }
        }
        else if (fileExt === ".css") {
            cssPaths.push(filePath);
        }
    };
    replaceJsonKeysInFile(targetFolder);
    cssPaths.forEach((cssPath) => {
        (0, css_1.obfuscateCss)(classConversion, cssPath, removeOriginalCss, !enableObfuscateMarkerClasses);
    });
}
exports.replaceJsonKeysInFiles = replaceJsonKeysInFiles;
function obfuscateKeys(selectorConversion, fileContent, contentIgnoreRegexes = [], useHtmlEntity = false) {
    const usedKeys = new Set();
    Object.keys(selectorConversion).forEach((key) => {
        const fileContentOriginal = fileContent;
        let keyUse = key.slice(1);
        keyUse = escapeRegExp(keyUse.replace(/\\/g, ""));
        let exactMatchRegex = new RegExp(`([\\s"'\\\`]|^)(${keyUse})(?=$|[\\s"'\\\`]|\\\\n|\\\\",|\\\\"})`, 'g');
        const replacement = `$1` + selectorConversion[key].slice(1).replace(/\\/g, "");
        const matches = fileContent.match(exactMatchRegex);
        const originalObscuredContentPairs = matches === null || matches === void 0 ? void 0 : matches.map((match) => {
            return { originalContent: match, obscuredContent: match.replace(exactMatchRegex, replacement) };
        });
        fileContent = fileContent.replace(exactMatchRegex, replacement);
        if (contentIgnoreRegexes.length > 0) {
            contentIgnoreRegexes.forEach((regex) => {
                const originalContentFragments = fileContentOriginal.match(regex);
                originalContentFragments === null || originalContentFragments === void 0 ? void 0 : originalContentFragments.map((originalContentFragment) => {
                    originalObscuredContentPairs === null || originalObscuredContentPairs === void 0 ? void 0 : originalObscuredContentPairs.map((pair) => {
                        if (originalContentFragments === null || originalContentFragments === void 0 ? void 0 : originalContentFragments.some((fragment) => fragment.includes(pair.originalContent))) {
                            log("debug", "Obscured keys:", `Ignored ${pair.originalContent} at ${originalContentFragment}`);
                            fileContent = fileContent.replace(originalContentFragment.replace(pair.originalContent, pair.obscuredContent), originalContentFragment);
                        }
                    });
                });
            });
        }
        if (fileContentOriginal !== fileContent && !usedKeys.has(key)) {
            usedKeys.add(key);
        }
    });
    return { obfuscatedContent: fileContent, usedKeys: usedKeys };
}
exports.obfuscateKeys = obfuscateKeys;
function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function getFilenameFromPath(filePath) {
    return filePath.replace(/^.*[\\/]/, '');
}
exports.getFilenameFromPath = getFilenameFromPath;
function normalizePath(filePath) {
    return filePath.replace(/\\/g, "/");
}
exports.normalizePath = normalizePath;
function loadAndMergeJsonFiles(jsonFolderPath) {
    const jsonFiles = {};
    fs_1.default.readdirSync(jsonFolderPath).forEach((file) => {
        const filePath = path_1.default.join(jsonFolderPath, file);
        const fileData = JSON.parse(fs_1.default.readFileSync(filePath, "utf-8"));
        Object.assign(jsonFiles, fileData);
    });
    return jsonFiles;
}
exports.loadAndMergeJsonFiles = loadAndMergeJsonFiles;
function findClosestSymbolPosition(content, openMarker, closeMarker, startPosition = 0, direction = "backward") {
    let level = 0;
    let currentPos = startPosition;
    if (direction === "backward") {
        while (currentPos >= 0 && level >= 0) {
            if (content.slice(currentPos, currentPos + openMarker.length) === openMarker) {
                level--;
            }
            else if (content.slice(currentPos, currentPos + closeMarker.length) === closeMarker) {
                level++;
            }
            currentPos--;
        }
        if (level < 0) {
            currentPos += 2;
        }
    }
    else {
        while (currentPos < content.length && level >= 0) {
            if (content.slice(currentPos, currentPos + openMarker.length) === openMarker) {
                level++;
            }
            else if (content.slice(currentPos, currentPos + closeMarker.length) === closeMarker) {
                level--;
            }
            currentPos++;
        }
        if (level < 0) {
            currentPos--;
        }
    }
    return currentPos;
}
exports.findClosestSymbolPosition = findClosestSymbolPosition;
function findContentBetweenMarker(content, targetStr, openMarker, closeMarker) {
    if (openMarker === closeMarker) {
        throw new Error("openMarker and closeMarker can not be the same");
    }
    let targetStrPosition = content.indexOf(targetStr);
    const truncatedContents = [];
    while (targetStrPosition !== -1 && targetStrPosition < content.length) {
        const openPos = findClosestSymbolPosition(content, openMarker, closeMarker, targetStrPosition, "backward");
        const closePos = findClosestSymbolPosition(content, openMarker, closeMarker, targetStrPosition, "forward");
        if (openPos === -1 && closePos === -1) {
            break;
        }
        if (openPos > -1 && closePos > -1) {
            truncatedContents.push(content.slice(openPos, closePos));
            targetStrPosition = content.indexOf(targetStr, closePos + 1);
        }
        else {
            targetStrPosition = content.indexOf(targetStr, targetStrPosition + 1);
        }
    }
    return truncatedContents;
}
exports.findContentBetweenMarker = findContentBetweenMarker;
function addKeysToRegistery(usedKeys) {
    usedKeys.forEach((key) => {
        usedKeyRegistery.add(key);
    });
}
exports.addKeysToRegistery = addKeysToRegistery;
function findAllFilesWithExt(ext, targetFolderPath) {
    if (!fs_1.default.existsSync(targetFolderPath)) {
        return [];
    }
    const targetExtFiles = [];
    function findCssFiles(dir) {
        const files = fs_1.default.readdirSync(dir);
        files.forEach((file) => {
            const filePath = normalizePath(path_1.default.join(dir, file));
            if (fs_1.default.statSync(filePath).isDirectory()) {
                findCssFiles(filePath);
            }
            else {
                if (file.endsWith(ext)) {
                    targetExtFiles.push(filePath);
                }
            }
        });
    }
    findCssFiles(targetFolderPath);
    return targetExtFiles;
}
exports.findAllFilesWithExt = findAllFilesWithExt;
let rng = undefined;
function getRandomString(length, seed, rngStateCode, str) {
    if (length <= 0 || !Number.isInteger(length)) {
        throw new Error("Length must be a positive integer");
    }
    if (!rng) {
        rng = new recoverable_random_1.default(seed);
    }
    if (rngStateCode) {
        rng.recoverState(rngStateCode);
    }
    let rn = rng.random(0, 1, true);
    if (str && seed) {
        rn = parseFloat(`0.${recoverable_random_1.default.stringToSeed(str) + recoverable_random_1.default.stringToSeed(seed)}`);
    }
    const randomString = rn.toString(36).substring(2, length - 1 + 2);
    const randomLetter = String.fromCharCode(Math.floor(rng.random(0, 1, true) * 26) + 97);
    return {
        rngStateCode: rng.getStateCode(),
        randomString: `${randomLetter}${randomString}`,
    };
}
exports.getRandomString = getRandomString;
function seedableSimplifyString(str, seed, rngStateCode) {
    if (!str) {
        throw new Error("String can not be empty");
    }
    if (!rng) {
        rng = new recoverable_random_1.default(seed);
    }
    if (rngStateCode) {
        rng.recoverState(rngStateCode);
    }
    const tempStr = str.replace(/[aeiouw\d_-]/gi, "");
    return {
        rngStateCode: rng.getStateCode(),
        randomString: tempStr.length < 1
            ? String.fromCharCode(Math.floor(rng.random(0, 1, true) * 26) + 97) + tempStr
            : tempStr,
    };
}
exports.seedableSimplifyString = seedableSimplifyString;
function simplifyString(alphabetPoistion) {
    if (alphabetPoistion <= 0 || !Number.isInteger(alphabetPoistion)) {
        throw new Error("Position must be a positive integer");
    }
    let dividend = alphabetPoistion;
    let columnName = "";
    let modulo = 0;
    while (dividend > 0) {
        modulo = (dividend - 1) % 26;
        columnName = String.fromCharCode(97 + modulo) + columnName;
        dividend = Math.floor((dividend - modulo) / 26);
    }
    return columnName;
}
exports.simplifyString = simplifyString;
function replaceFirstMatch(source, find, replace) {
    const index = source.indexOf(find);
    if (index !== -1) {
        return source.slice(0, index) + replace + source.slice(index + find.length);
    }
    return source;
}
exports.replaceFirstMatch = replaceFirstMatch;
function duplicationCheck(arr) {
    const set = new Set(arr);
    return arr.length !== set.size;
}
exports.duplicationCheck = duplicationCheck;
function createKey(str) {
    const b64 = Buffer.from(str).toString("base64").replace(/=/g, "");
    return `{{{{{{${b64}}}}}}}`;
}
exports.createKey = createKey;
function decodeKey(str) {
    const regex = /{{{{{{([\w\+\/]+)}}}}}}/g;
    str = str.replace(regex, (match, p1) => {
        const padding = p1.length % 4 === 0 ? 0 : 4 - (p1.length % 4);
        const b64 = p1 + "=".repeat(padding);
        return Buffer.from(b64, "base64").toString("ascii");
    });
    return str;
}
exports.decodeKey = decodeKey;
