"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obfuscateHtmlClassNames = exports.findHtmlTagContentsByClass = exports.findHtmlTagContents = void 0;
const tslib_1 = require("tslib");
const htmlparser2 = tslib_1.__importStar(require("htmlparser2"));
const utils_1 = require("../utils");
const js_1 = require("./js");
function findHtmlTagContentsRecursive(content, targetTag, targetClass = null, foundTagContents = [], deep = 0, maxDeep = -1) {
    let contentAfterTag = content;
    const startTagWithClassRegexStr = targetClass ?
        `(<\\w+?\\s+?class\\s*=\\s*['\"][^'\"]*?\\b${targetClass}\\b)`
        : "";
    const startTagRegexStr = `(<${targetTag}[\\s|>])`;
    const endTagRegexStr = `(<\/${targetTag}>)`;
    const clearContentBeforeStartTagRegex = new RegExp(`${startTagWithClassRegexStr ? startTagWithClassRegexStr + ".*|" + startTagRegexStr : startTagRegexStr + ".*"}`, "i");
    const contentAfterStartTagMatch = contentAfterTag.match(clearContentBeforeStartTagRegex);
    if (contentAfterStartTagMatch) {
        contentAfterTag = contentAfterStartTagMatch[0];
    }
    let endTagCont = 0;
    const endTagContRegex = new RegExp(endTagRegexStr, "gi");
    const endTagContMatch = contentAfterTag.match(endTagContRegex);
    if (endTagContMatch) {
        endTagCont = endTagContMatch.length;
    }
    let closeTagPoition = 0;
    const tagPatternRegex = new RegExp(`${startTagWithClassRegexStr ? startTagWithClassRegexStr + "|" + startTagRegexStr : startTagRegexStr}|${endTagRegexStr}`, "gi");
    const tagPatternMatch = contentAfterTag.match(tagPatternRegex);
    if (tagPatternMatch) {
        let tagCount = 0;
        let markedPosition = false;
        for (let i = 0; i < tagPatternMatch.length; i++) {
            if (tagPatternMatch[i].startsWith("</")) {
                if (!markedPosition) {
                    closeTagPoition = endTagCont - tagCount;
                    markedPosition = true;
                }
                tagCount--;
            }
            else {
                tagCount++;
            }
            if (tagCount == 0) {
                break;
            }
        }
        ;
    }
    const tagEndRegex = new RegExp(`(.*)${endTagRegexStr}`, "i");
    for (let i = 0; i < closeTagPoition; i++) {
        const tagCloseMatch = contentAfterTag.match(tagEndRegex);
        if (tagCloseMatch) {
            contentAfterTag = tagCloseMatch[1];
        }
    }
    const clearContentAfterCloseTagRegex = new RegExp(`.*${endTagRegexStr}`, "i");
    const clearContentAfterCloseTagMatch = contentAfterTag.match(clearContentAfterCloseTagRegex);
    if (clearContentAfterCloseTagMatch) {
        contentAfterTag = clearContentAfterCloseTagMatch[0];
        foundTagContents.push(contentAfterTag);
    }
    const remainingHtmlRegex = new RegExp(contentAfterTag.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + "(.*)", "i");
    const remainingHtmlMatch = content.match(remainingHtmlRegex);
    if (remainingHtmlMatch) {
        const remainingHtml = remainingHtmlMatch[1];
        const remainingHtmlTagRegex = new RegExp(`(<\\w+?>)`, "i");
        const remainingHtmlTagMatch = remainingHtml.match(remainingHtmlTagRegex);
        if (remainingHtmlTagMatch) {
            if (maxDeep === -1 || deep < maxDeep) {
                return findHtmlTagContentsRecursive(remainingHtml, targetTag, targetClass, foundTagContents, deep + 1, maxDeep);
            }
            else {
                (0, utils_1.log)("warn", "HTML search:", "Max deep reached, recursive break");
                return foundTagContents;
            }
        }
    }
    return foundTagContents;
}
function findHtmlTagContents(content, targetTag, targetClass = null) {
    return findHtmlTagContentsRecursive(content, targetTag, targetClass);
}
exports.findHtmlTagContents = findHtmlTagContents;
function findHtmlTagContentsByClass(content, targetClass) {
    const regex = new RegExp(`(<(\\w+)\\s+class\\s*=\\s*['\"][^'\"]*?\\b${targetClass}\\b)`, "i");
    const match = content.match(regex);
    if (match) {
        const tag = match[2];
        return findHtmlTagContents(content, tag, targetClass);
    }
    else {
        return [];
    }
}
exports.findHtmlTagContentsByClass = findHtmlTagContentsByClass;
function obfuscateHtmlClassNames({ html, selectorConversion, obfuscateMarkerClass = "", contentIgnoreRegexes = [], }) {
    const voidTags = ["area", "base", "br", "col", "command", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"];
    let modifiedHtml = "";
    let insideObsClassScope = false;
    let ObsClassScopeTagCount = 0;
    let ObsClassScopeTag = "";
    let scriptContent = "";
    let isScriptTag = false;
    const usedKeys = [];
    const parser = new htmlparser2.Parser({
        onprocessinginstruction(name, data) {
            modifiedHtml += `<${data}>`;
        },
        onopentag(tagName, attribs) {
            if (tagName === "script") {
                isScriptTag = true;
                scriptContent = "";
            }
            if (attribs.class) {
                if (!insideObsClassScope && obfuscateMarkerClass && attribs.class.includes(obfuscateMarkerClass)) {
                    insideObsClassScope = true;
                    ObsClassScopeTag = tagName;
                }
                if (insideObsClassScope || !obfuscateMarkerClass) {
                    const { obfuscatedContent, usedKeys: _usedKeys } = (0, utils_1.obfuscateKeys)(selectorConversion, attribs.class, [], true);
                    usedKeys.push(..._usedKeys);
                    attribs.class = obfuscatedContent;
                }
            }
            if (insideObsClassScope && tagName === ObsClassScopeTag) {
                ObsClassScopeTagCount++;
            }
            modifiedHtml += `<${tagName}`;
            for (const key in attribs) {
                modifiedHtml += ` ${key}="${attribs[key]}"`;
            }
            if (voidTags.includes(tagName)) {
                modifiedHtml += " />";
            }
            else {
                modifiedHtml += ">";
            }
        },
        oncomment(comment) {
            modifiedHtml += `<!--${comment}-->`;
        },
        ontext(text) {
            if (isScriptTag) {
                scriptContent += text;
            }
            else {
                modifiedHtml += text;
            }
        },
        onclosetag(tagname) {
            if (voidTags.includes(tagname)) {
                return;
            }
            if (tagname === "script" && isScriptTag) {
                isScriptTag = false;
                let obfuscatedScriptContent = scriptContent;
                Object.keys(selectorConversion).forEach((key) => {
                    const className = key.slice(1);
                    const obfuscatedJs = (0, js_1.obfuscateJs)(obfuscatedScriptContent, className, { [key]: selectorConversion[key] }, "{a HTML file path}", contentIgnoreRegexes);
                    if (obfuscatedJs !== obfuscatedScriptContent) {
                        obfuscatedScriptContent = obfuscatedJs;
                        usedKeys.push(key);
                    }
                });
                modifiedHtml += `${obfuscatedScriptContent}`;
            }
            modifiedHtml += `</${tagname}>`;
            if (insideObsClassScope && tagname === ObsClassScopeTag) {
                ObsClassScopeTagCount--;
            }
            if (ObsClassScopeTagCount === 0) {
                insideObsClassScope = false;
            }
        }
    }, { decodeEntities: true });
    parser.write(html);
    parser.end();
    return {
        obfuscatedContent: modifiedHtml,
        usedKeys: Array.from(new Set(usedKeys))
    };
}
exports.obfuscateHtmlClassNames = obfuscateHtmlClassNames;
