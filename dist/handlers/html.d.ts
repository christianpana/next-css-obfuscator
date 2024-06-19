import { SelectorConversion } from "../types";
declare function findHtmlTagContents(content: string, targetTag: string, targetClass?: string | null): string[];
declare function findHtmlTagContentsByClass(content: string, targetClass: string): string[];
declare function obfuscateHtmlClassNames({ html, selectorConversion, obfuscateMarkerClass, contentIgnoreRegexes, }: {
    html: string;
    selectorConversion: SelectorConversion;
    obfuscateMarkerClass?: string;
    contentIgnoreRegexes?: RegExp[];
}): {
    obfuscatedContent: string;
    usedKeys: string[];
};
export { findHtmlTagContents, findHtmlTagContentsByClass, obfuscateHtmlClassNames, };
