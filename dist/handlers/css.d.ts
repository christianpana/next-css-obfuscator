import { obfuscateMode, SelectorConversion } from "../types";
declare function extractClassFromSelector(selector: string, replacementClassNames?: (string | undefined)[]): {
    selector: string;
    extractedClasses: string[];
};
declare function createSelectorConversionJson({ selectorConversionJsonFolderPath, buildFolderPath, mode, classNameLength, classPrefix, classSuffix, classIgnore, enableObfuscateMarkerClasses, generatorSeed, }: {
    selectorConversionJsonFolderPath: string;
    buildFolderPath: string;
    mode?: obfuscateMode;
    classNameLength?: number;
    classPrefix?: string;
    classSuffix?: string;
    classIgnore?: (string | RegExp)[];
    enableObfuscateMarkerClasses?: boolean;
    generatorSeed?: string;
}): void;
declare function copyCssData(targetSelector: string, newSelectorName: string, cssObj: any): any;
declare function renameCssSelector(oldSelector: string, newSelector: string, cssObj: any): any;
declare function obfuscateCss(selectorConversion: SelectorConversion, cssPath: string, replaceOriginalSelector?: boolean, isFullObfuscation?: boolean, outCssPath?: string): void;
export { copyCssData, renameCssSelector, createSelectorConversionJson, obfuscateCss, extractClassFromSelector, };
