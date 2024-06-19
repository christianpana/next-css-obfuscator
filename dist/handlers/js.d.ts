import { SelectorConversion } from "../types";
declare function searchForwardComponent(content: string): never[] | RegExpMatchArray;
declare function obfuscateForwardComponentJs(searchContent: string, wholeContent: string, selectorConversion: SelectorConversion): {
    name: string;
    componentCode: string;
    componentObfuscatedCode: string;
}[];
declare function obfuscateJs(content: string, key: string, selectorCoversion: SelectorConversion, filePath: string, contentIgnoreRegexes?: RegExp[], useAst?: boolean): string;
export { obfuscateForwardComponentJs, obfuscateJs, searchForwardComponent, };
