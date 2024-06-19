"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractClassFromSelector = exports.obfuscateCss = exports.createSelectorConversionJson = exports.renameCssSelector = exports.copyCssData = void 0;
const tslib_1 = require("tslib");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const css_1 = tslib_1.__importDefault(require("css"));
const recoverable_random_1 = tslib_1.__importDefault(require("recoverable-random"));
const utils_1 = require("../utils");
let randomStringGeneraterStateCode = undefined;
let currentAlphabetPoistion = 1;
function createNewClassName(mode, className, classPrefix = "", classSuffix = "", classNameLength = 5, seed = Math.random().toString()) {
    let newClassName = className;
    let { rngStateCode, randomString } = { rngStateCode: "", randomString: "" };
    switch (mode) {
        case "random":
            ({ rngStateCode, randomString } = (0, utils_1.getRandomString)(classNameLength, seed, undefined, className));
            break;
        case "simplify-seedable":
            ({ rngStateCode, randomString } = (0, utils_1.seedableSimplifyString)(className, seed, seed + recoverable_random_1.default.stringToSeed(className).toString()));
            break;
        case "simplify":
            randomString = (0, utils_1.simplifyString)(currentAlphabetPoistion);
            currentAlphabetPoistion++;
            break;
        default:
            break;
    }
    newClassName = randomString;
    randomStringGeneraterStateCode = rngStateCode;
    if (classPrefix) {
        newClassName = `${classPrefix}${newClassName}`;
    }
    if (classSuffix) {
        newClassName = `${newClassName}${classSuffix}`;
    }
    return newClassName;
}
const findActionSelectorsRegex = /(?<!\\)(?:\:\w[\w-]+)(?=\:|\)|\s|\(|$|"|{|>)/g;
function extractClassFromSelector(selector, replacementClassNames) {
    const extractClassRegex = /(?<=[.:!]|(?<!\w)\.-)((?:[\w\-]|\\[\w\%\:\.\!\*\<\>\/]|(?:\\\[(?:[^\[\]\s])*\\\]))+)(?![\w\-]*\()/g;
    const vendorPseudoClassRegexes = [
        /::?-moz-[\w-]+/g,
        /::?-ms-[\w-]+/g,
        /::?-webkit-[\w-]+/g,
        /::?-o-[\w-]+/g,
    ];
    selector = selector.replace(findActionSelectorsRegex, (match) => {
        return (0, utils_1.createKey)(match);
    });
    vendorPseudoClassRegexes.forEach((regex, i) => {
        selector = selector.replace(regex, (match) => {
            return (0, utils_1.createKey)(match);
        });
    });
    let classes = selector.match(extractClassRegex);
    if (replacementClassNames !== undefined) {
        selector = selector.replace(extractClassRegex, (originalClassName) => {
            return replacementClassNames.shift() || originalClassName;
        });
    }
    selector = (0, utils_1.decodeKey)(selector);
    return {
        selector: selector,
        extractedClasses: classes || []
    };
}
exports.extractClassFromSelector = extractClassFromSelector;
function getAllSelector(cssObj) {
    const selectors = [];
    function recursive(rules) {
        for (const item of rules) {
            if (item.rules) {
                recursive(item.rules);
            }
            else if (item.selectors) {
                item.selectors = item.selectors.filter((selector) => selector !== "");
                selectors.push(...item.selectors);
            }
        }
        return null;
    }
    recursive(cssObj.stylesheet.rules);
    return selectors;
}
function createSelectorConversionJson({ selectorConversionJsonFolderPath, buildFolderPath, mode = "random", classNameLength = 5, classPrefix = "", classSuffix = "", classIgnore = [], enableObfuscateMarkerClasses = false, generatorSeed = Math.random().toString().slice(2, 10), }) {
    if (!fs_1.default.existsSync(selectorConversionJsonFolderPath)) {
        fs_1.default.mkdirSync(selectorConversionJsonFolderPath);
    }
    const selectorConversion = (0, utils_1.loadAndMergeJsonFiles)(selectorConversionJsonFolderPath);
    if (enableObfuscateMarkerClasses) {
        selectorConversion[".dark"] = ".dark";
    }
    const cssPaths = (0, utils_1.findAllFilesWithExt)(".css", buildFolderPath);
    const selectors = [];
    cssPaths.forEach((cssPath) => {
        const cssContent = fs_1.default.readFileSync(cssPath, "utf-8");
        const cssObj = css_1.default.parse(cssContent);
        selectors.push(...getAllSelector(cssObj));
    });
    const uniqueSelectors = [...new Set(selectors)];
    const allowClassStartWith = [".", "#", ":is(", ":where(", ":not(",
        ":matches(", ":nth-child(", ":nth-last-child(",
        ":nth-of-type(", ":nth-last-of-type(", ":first-child(",
        ":last-child(", ":first-of-type(", ":last-of-type(",
        ":only-child(", ":only-of-type(", ":empty(", ":link(",
        ":visited(", ":active(", ":hover(", ":focus(", ":target(",
        ":lang(", ":enabled(", ":disabled(", ":checked(", ":default(",
        ":indeterminate(", ":root(", ":before(",
        ":after(", ":first-letter(", ":first-line(", ":selection(",
        ":read-only(", ":read-write(", ":fullscreen(", ":optional(",
        ":required(", ":valid(", ":invalid(", ":in-range(", ":out-of-range(",
        ":placeholder-shown("
    ];
    const selectorClassPair = {};
    for (let i = 0; i < uniqueSelectors.length; i++) {
        const originalSelector = uniqueSelectors[i];
        const { extractedClasses } = extractClassFromSelector(originalSelector) || [];
        selectorClassPair[originalSelector] = extractedClasses;
    }
    const sortedSelectorClassPair = Object.entries(selectorClassPair)
        .sort((a, b) => a[1].length - b[1].length)
        .filter((pair) => pair[1].length > 0);
    for (let i = 0; i < sortedSelectorClassPair.length; i++) {
        const [originalSelector, selectorClasses] = sortedSelectorClassPair[i];
        if (selectorClasses.length == 0) {
            continue;
        }
        let selector = originalSelector;
        let classes = selectorClasses;
        if (classes && allowClassStartWith.some((start) => selector.startsWith(start))) {
            classes = classes.map((className) => {
                if (classIgnore.some(regex => {
                    if (typeof regex === "string") {
                        return className === regex;
                    }
                    return new RegExp(regex).test(className);
                })) {
                    return className;
                }
                let obfuscatedSelector = selectorConversion[`.${className}`];
                if (!obfuscatedSelector) {
                    const obfuscatedClass = createNewClassName(mode, className, classPrefix, classSuffix, classNameLength, generatorSeed);
                    obfuscatedSelector = `.${obfuscatedClass}`;
                    selectorConversion[`.${className}`] = obfuscatedSelector;
                }
                return obfuscatedSelector.slice(1);
            });
            const { selector: obfuscatedSelector } = extractClassFromSelector(originalSelector, classes);
            selectorConversion[originalSelector] = obfuscatedSelector;
        }
    }
    const jsonPath = path_1.default.join(process.cwd(), selectorConversionJsonFolderPath, "conversion.json");
    fs_1.default.writeFileSync(jsonPath, JSON.stringify(selectorConversion, null, 2));
    if ((0, utils_1.duplicationCheck)(Object.keys(selectorConversion))) {
        if (mode == "random") {
            (0, utils_1.log)("error", "Obfuscation", "Duplicated class names found in the conversion JSON, try to increase the class name length / open an issue on GitHub https://github.com/soranoo/next-css-obfuscator/issues");
        }
        else {
            (0, utils_1.log)("error", "Obfuscation", "Duplicated class names found in the conversion JSON, please open an issue on GitHub https://github.com/soranoo/next-css-obfuscator/issues");
        }
    }
}
exports.createSelectorConversionJson = createSelectorConversionJson;
function copyCssData(targetSelector, newSelectorName, cssObj) {
    function recursive(rules) {
        return rules.map((item) => {
            if (item.rules) {
                let newRules = recursive(item.rules);
                if (Array.isArray(newRules)) {
                    newRules = newRules.flat();
                }
                return Object.assign(Object.assign({}, item), { rules: newRules });
            }
            else if (item.selectors) {
                item.selectors = item.selectors.filter((selector) => selector !== "");
                if (item.selectors.includes(targetSelector)) {
                    const newRule = JSON.parse(JSON.stringify(item));
                    newRule.selectors = [newSelectorName];
                    return [item, newRule];
                }
                else {
                    return item;
                }
            }
            else {
                return item;
            }
        });
    }
    cssObj.stylesheet.rules = recursive(cssObj.stylesheet.rules).flat();
    return cssObj;
}
exports.copyCssData = copyCssData;
function renameCssSelector(oldSelector, newSelector, cssObj) {
    function recursive(rules) {
        return rules.map((item) => {
            if (item.rules) {
                return Object.assign(Object.assign({}, item), { rules: recursive(item.rules) });
            }
            else if (item.selectors) {
                item.selectors = item.selectors.filter((selector) => selector !== "");
                let updatedSelectors = item.selectors.map((selector) => selector === oldSelector ? newSelector : selector);
                return Object.assign(Object.assign({}, item), { selectors: updatedSelectors });
            }
            else {
                return item;
            }
        });
    }
    cssObj.stylesheet.rules = recursive(cssObj.stylesheet.rules);
    return cssObj;
}
exports.renameCssSelector = renameCssSelector;
function obfuscateCss(selectorConversion, cssPath, replaceOriginalSelector = false, isFullObfuscation = false, outCssPath) {
    if (!outCssPath) {
        outCssPath = cssPath;
    }
    else if (!fs_1.default.existsSync(path_1.default.dirname(outCssPath))) {
        fs_1.default.mkdirSync(path_1.default.dirname(outCssPath));
    }
    let cssContent = fs_1.default.readFileSync(cssPath, "utf-8");
    let cssObj = css_1.default.parse(cssContent);
    const cssRulesCount = cssObj.stylesheet.rules.length;
    if (isFullObfuscation) {
        Object.keys(selectorConversion).forEach((key) => {
            utils_1.usedKeyRegistery.add(key);
        });
    }
    else {
        Object.keys(selectorConversion).forEach((key) => {
            if (key.startsWith(":")) {
                utils_1.usedKeyRegistery.add(key);
            }
        });
        const actionSelectors = getAllSelector(cssObj).filter((selector) => selector.match(findActionSelectorsRegex));
        actionSelectors.forEach((actionSelector) => {
            utils_1.usedKeyRegistery.add(actionSelector);
        });
        const tailwindCssChildSelectors = getAllSelector(cssObj).filter((selector) => selector.startsWith(".\\["));
        tailwindCssChildSelectors.forEach((tailwindCssChildSelector) => {
            utils_1.usedKeyRegistery.add(tailwindCssChildSelector);
        });
        const universalSelectors = getAllSelector(cssObj).filter((selector) => selector.includes(">"));
        universalSelectors.forEach((universalSelector) => {
            utils_1.usedKeyRegistery.add(universalSelector);
        });
    }
    utils_1.usedKeyRegistery.forEach((key) => {
        const originalSelectorName = key;
        const obfuscatedSelectorName = selectorConversion[key];
        if (obfuscatedSelectorName) {
            if (replaceOriginalSelector) {
                cssObj = renameCssSelector(originalSelectorName, selectorConversion[key], cssObj);
            }
            else {
                cssObj = copyCssData(originalSelectorName, selectorConversion[key], cssObj);
            }
        }
    });
    if (replaceOriginalSelector) {
        (0, utils_1.log)("info", "CSS rules:", `Modified ${utils_1.usedKeyRegistery.size} CSS rules to ${(0, utils_1.getFilenameFromPath)(cssPath)}`);
    }
    else {
        (0, utils_1.log)("info", "CSS rules:", `Added ${cssObj.stylesheet.rules.length - cssRulesCount} new CSS rules to ${(0, utils_1.getFilenameFromPath)(cssPath)}`);
    }
    const cssOptions = {
        compress: true,
    };
    const cssObfuscatedContent = css_1.default.stringify(cssObj, cssOptions);
    const sizeBefore = Buffer.byteLength(cssContent, "utf8");
    fs_1.default.writeFileSync(outCssPath, cssObfuscatedContent);
    const sizeAfter = Buffer.byteLength(cssObfuscatedContent, "utf8");
    const percentChange = Math.round(((sizeAfter) / sizeBefore) * 100);
    (0, utils_1.log)("success", "CSS obfuscated:", `Size from ${sizeBefore} to ${sizeAfter} bytes (${percentChange}%) in ${(0, utils_1.getFilenameFromPath)(cssPath)}`);
}
exports.obfuscateCss = obfuscateCss;
