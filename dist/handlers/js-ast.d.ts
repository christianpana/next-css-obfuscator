import { NodePath } from "@babel/traverse";
import * as t from "@babel/types";
import { type SelectorConversion } from "../types";
declare function obfuscateJsWithAst(code: string, selectorConversion: SelectorConversion | undefined, startingKeys?: string[], stripUnnecessarySpace?: boolean): {
    obfuscatedCode: string;
    usedKeys: Set<string>;
};
declare function searchStringLiterals(path: NodePath<t.Node>, callback: (str: string) => void | string, scannedNodes?: Set<t.Node>): NodePath<t.Node> | undefined;
export { searchStringLiterals, obfuscateJsWithAst, };
