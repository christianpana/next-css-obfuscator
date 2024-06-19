"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchForwardComponent = exports.obfuscateJs = exports.obfuscateForwardComponentJs = void 0;
const utils_1 = require("../utils");
const js_ast_1 = require("./js-ast");
function searchForwardComponent(content) {
    const componentSearchRegex = /(?<=\.jsx\()[^,|"|']+/g;
    const match = content.match(componentSearchRegex);
    if (match) {
        return match;
    }
    return [];
}
exports.searchForwardComponent = searchForwardComponent;
function searchComponent(content, componentName) {
    const componentSearchRegex = new RegExp(`\\b(?:const|let|var)\\s+(${componentName})\\s*=\\s*.*?(\\{)`, "g");
    const match = content.match(componentSearchRegex);
    let openSymbolPos = -1;
    if (match) {
        openSymbolPos = content.indexOf(match[0]) + match[0].length;
    }
    const closeMarkerPos = (0, utils_1.findClosestSymbolPosition)(content, "{", "}", openSymbolPos, "forward");
    const componentContent = content.slice(openSymbolPos, closeMarkerPos);
    return componentContent;
}
function obfuscateForwardComponentJs(searchContent, wholeContent, selectorConversion) {
    const componentNames = searchForwardComponent(searchContent).filter((componentName) => {
        return !componentName.includes(".");
    });
    const componentsCode = componentNames.map(componentName => {
        const componentContent = searchComponent(wholeContent, componentName);
        return {
            name: componentName,
            code: componentContent
        };
    });
    const componentsObfuscatedCode = componentsCode.map((componentContent) => {
        const classNameBlocks = (0, utils_1.findContentBetweenMarker)(componentContent.code, "className:", "{", "}");
        const obfuscatedClassNameBlocks = classNameBlocks.map(block => {
            const { obfuscatedContent, usedKeys } = (0, utils_1.obfuscateKeys)(selectorConversion, block);
            (0, utils_1.addKeysToRegistery)(usedKeys);
            return obfuscatedContent;
        });
        if (classNameBlocks.length !== obfuscatedClassNameBlocks.length) {
            (0, utils_1.log)("error", `Component obfuscation:`, `classNameBlocks.length !== obfuscatedClassNameBlocks.length`);
            return componentContent;
        }
        let obscuredCode = componentContent.code;
        for (let i = 0; i < classNameBlocks.length; i++) {
            obscuredCode = (0, utils_1.replaceFirstMatch)(obscuredCode, classNameBlocks[i], obfuscatedClassNameBlocks[i]);
        }
        (0, utils_1.log)("debug", `Obscured keys in component:`, componentContent.name);
        return {
            name: componentContent.name,
            code: obscuredCode
        };
    });
    const componentObfuscatedcomponentCodePairs = [];
    for (let i = 0; i < componentsCode.length; i++) {
        if (componentsCode[i] !== componentsObfuscatedCode[i]) {
            componentObfuscatedcomponentCodePairs.push({
                name: componentsCode[i].name,
                componentCode: componentsCode[i].code,
                componentObfuscatedCode: componentsObfuscatedCode[i].code
            });
        }
    }
    for (let i = 0; i < componentsCode.length; i++) {
        const childComponentObfuscatedcomponentCodePairs = obfuscateForwardComponentJs(componentsCode[i].code, wholeContent, selectorConversion);
        componentObfuscatedcomponentCodePairs.push(...childComponentObfuscatedcomponentCodePairs);
    }
    return componentObfuscatedcomponentCodePairs;
}
exports.obfuscateForwardComponentJs = obfuscateForwardComponentJs;
function obfuscateJs(content, key, selectorCoversion, filePath, contentIgnoreRegexes = [], useAst = false) {
    if (useAst) {
        try {
            const { obfuscatedCode, usedKeys } = (0, js_ast_1.obfuscateJsWithAst)(content, selectorCoversion, key ? [key] : [], true);
            (0, utils_1.addKeysToRegistery)(usedKeys);
            if (content !== obfuscatedCode) {
                (0, utils_1.log)("debug", `Obscured keys with AST and marker "${key}":`, `${(0, utils_1.normalizePath)(filePath)}`);
            }
            return obfuscatedCode;
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                (0, utils_1.log)("warn", "Syntax error ignored:", error);
                (0, utils_1.log)("warn", "Obfuscation with AST failed:", "Falling back to regex obfuscation");
            }
            else {
                throw error;
            }
        }
    }
    const truncatedContents = (0, utils_1.findContentBetweenMarker)(content, key, "{", "}");
    truncatedContents.forEach((truncatedContent) => {
        const { obfuscatedContent, usedKeys } = (0, utils_1.obfuscateKeys)(selectorCoversion, truncatedContent, contentIgnoreRegexes);
        (0, utils_1.addKeysToRegistery)(usedKeys);
        if (truncatedContent !== obfuscatedContent) {
            content = content.replace(truncatedContent, obfuscatedContent);
            (0, utils_1.log)("debug", `Obscured keys with marker "${key}":`, `${(0, utils_1.normalizePath)(filePath)}`);
        }
    });
    return content;
}
exports.obfuscateJs = obfuscateJs;
