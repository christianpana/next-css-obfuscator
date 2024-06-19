import { type LogLevel, type SelectorConversion } from "./types";
declare function log(type: LogLevel, task: string, data: any): void;
declare function setLogLevel(level: LogLevel): void;
declare const usedKeyRegistery: Set<string>;
declare function replaceJsonKeysInFiles({ targetFolder, allowExtensions, selectorConversionJsonFolderPath, contentIgnoreRegexes, whiteListedFolderPaths, blackListedFolderPaths, enableObfuscateMarkerClasses, obfuscateMarkerClasses, removeObfuscateMarkerClassesAfterObfuscated, removeOriginalCss, enableJsAst, }: {
    targetFolder: string;
    allowExtensions: string[];
    selectorConversionJsonFolderPath: string;
    contentIgnoreRegexes: RegExp[];
    whiteListedFolderPaths: (string | RegExp)[];
    blackListedFolderPaths: (string | RegExp)[];
    enableObfuscateMarkerClasses: boolean;
    obfuscateMarkerClasses: string[];
    removeObfuscateMarkerClassesAfterObfuscated: boolean;
    removeOriginalCss: boolean;
    enableJsAst: boolean;
}): void;
declare function obfuscateKeys(selectorConversion: SelectorConversion, fileContent: string, contentIgnoreRegexes?: RegExp[], useHtmlEntity?: boolean): {
    obfuscatedContent: string;
    usedKeys: Set<string>;
};
declare function getFilenameFromPath(filePath: string): string;
declare function normalizePath(filePath: string): string;
declare function loadAndMergeJsonFiles(jsonFolderPath: string): {
    [key: string]: any;
};
declare function findClosestSymbolPosition(content: string, openMarker: string, closeMarker: string, startPosition?: number, direction?: "forward" | "backward"): number;
declare function findContentBetweenMarker(content: string, targetStr: string, openMarker: string, closeMarker: string): string[];
declare function addKeysToRegistery(usedKeys: Set<string> | string[]): void;
declare function findAllFilesWithExt(ext: string, targetFolderPath: string): string[];
declare function getRandomString(length: number, seed?: string, rngStateCode?: string, str?: string): {
    rngStateCode: string;
    randomString: string;
};
declare function seedableSimplifyString(str: string, seed?: string, rngStateCode?: string): {
    rngStateCode: string;
    randomString: string;
};
declare function simplifyString(alphabetPoistion: number): string;
declare function replaceFirstMatch(source: string, find: string, replace: string): string;
declare function duplicationCheck(arr: string[]): boolean;
declare function createKey(str: string): string;
declare function decodeKey(str: string): string;
export { getFilenameFromPath, log, normalizePath, loadAndMergeJsonFiles, replaceJsonKeysInFiles, setLogLevel, findContentBetweenMarker, replaceFirstMatch, findAllFilesWithExt, getRandomString, seedableSimplifyString, usedKeyRegistery, obfuscateKeys, findClosestSymbolPosition, addKeysToRegistery, duplicationCheck, createKey, decodeKey, simplifyString };
