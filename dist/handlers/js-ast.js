"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.obfuscateJsWithAst = exports.searchStringLiterals = void 0;
const tslib_1 = require("tslib");
const parser = tslib_1.__importStar(require("@babel/parser"));
const traverse_1 = tslib_1.__importDefault(require("@babel/traverse"));
const t = tslib_1.__importStar(require("@babel/types"));
const generator_1 = tslib_1.__importDefault(require("@babel/generator"));
const utils_1 = require("../utils");
function obfuscateJsWithAst(code, selectorConversion, startingKeys = [], stripUnnecessarySpace = true) {
    const ast = parser.parse(code, { sourceType: "module", plugins: ["jsx"] });
    const usedKeys = new Set();
    (0, traverse_1.default)(ast, {
        ObjectProperty(path) {
            if (t.isIdentifier(path.node.key) && path.node.key.name === "className") {
                searchStringLiterals(path.get("value"), (str) => {
                    if (startingKeys.length > 0 && !startingKeys.includes(str)) {
                        return str;
                    }
                    if (!selectorConversion) {
                        return "{{obfuscated}}";
                    }
                    str = stripUnnecessarySpace ? str.replace(/\s+/g, " ").trim() : str;
                    const { obfuscatedContent, usedKeys: obfuscateUsedKeys } = (0, utils_1.obfuscateKeys)(selectorConversion, str);
                    if (obfuscatedContent !== str) {
                        obfuscateUsedKeys.forEach(key => usedKeys.add(key));
                        return obfuscatedContent;
                    }
                });
            }
        },
    });
    const options = {
        compact: true,
        concise: true,
        retainLines: false,
        comments: false,
        minified: true,
    };
    const obfuscatedCode = (0, generator_1.default)(ast, options, code);
    return {
        obfuscatedCode: obfuscatedCode.code,
        usedKeys: usedKeys
    };
}
exports.obfuscateJsWithAst = obfuscateJsWithAst;
function searchStringLiterals(path, callback, scannedNodes = new Set()) {
    if (path.node && scannedNodes.has(path.node)) {
        return;
    }
    scannedNodes.add(path.node);
    if (t.isBlockStatement(path.node)) {
        const body = path.get("body");
        if (Array.isArray(body)) {
            body.forEach(nodePath => {
                switch (nodePath.node.type) {
                    case "ReturnStatement":
                    case "IfStatement":
                    case "SwitchStatement":
                    case "ExpressionStatement":
                    case "ForStatement":
                    case "WhileStatement":
                    case "TryStatement":
                        searchStringLiterals(nodePath, callback, scannedNodes);
                        break;
                }
            });
        }
        else {
            searchStringLiterals(body, callback, scannedNodes);
        }
    }
    else if (t.isReturnStatement(path.node)) {
        const argument = path.get("argument");
        if (argument && !Array.isArray(argument)) {
            searchStringLiterals(argument, callback);
        }
        else if (Array.isArray(argument)) {
            argument.forEach(arg => {
                searchStringLiterals(arg, callback, scannedNodes);
            });
        }
    }
    else if (t.isBinaryExpression(path.node)) {
        const left = path.get("left");
        const right = path.get("right");
        if (left && !Array.isArray(left)) {
            searchStringLiterals(left, callback, scannedNodes);
        }
        if (right && !Array.isArray(right)) {
            searchStringLiterals(right, callback, scannedNodes);
        }
    }
    else if (t.isStringLiteral(path.node)) {
        const replacement = callback(path.node.value);
        if (replacement) {
            path.replaceWith(t.stringLiteral(replacement));
        }
    }
    else if (t.isCallExpression(path.node)) {
        const callee = path.get("callee");
        if (callee && !Array.isArray(callee)) {
            searchStringLiterals(callee, callback, scannedNodes);
        }
        const args = path.get("arguments");
        if (Array.isArray(args)) {
            args.forEach(arg => {
                if (t.isStringLiteral(arg.node)) {
                    const replacement = callback(arg.node.value);
                    if (replacement) {
                        arg.replaceWith(t.stringLiteral(replacement));
                    }
                }
                else {
                    searchStringLiterals(arg, callback, scannedNodes);
                }
            });
        }
    }
    else if (t.isConditionalExpression(path.node)) {
        const test = path.get("test");
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        if (test && !Array.isArray(test)) {
            searchStringLiterals(test, callback, scannedNodes);
        }
        if (consequent && !Array.isArray(consequent)) {
            searchStringLiterals(consequent, callback, scannedNodes);
        }
        if (alternate && !Array.isArray(alternate)) {
            searchStringLiterals(alternate, callback, scannedNodes);
        }
    }
    else if (t.isIfStatement(path.node)) {
        const test = path.get("test");
        const consequent = path.get("consequent");
        const alternate = path.get("alternate");
        if (test && !Array.isArray(test)) {
            searchStringLiterals(test, callback, scannedNodes);
        }
        if (consequent && !Array.isArray(consequent)) {
            searchStringLiterals(consequent, callback, scannedNodes);
        }
        if (alternate && !Array.isArray(alternate)) {
            searchStringLiterals(alternate, callback, scannedNodes);
        }
    }
    else if (t.isObjectExpression(path.node)) {
        const properties = path.get("properties");
        if (Array.isArray(properties)) {
            properties.forEach(prop => {
                searchStringLiterals(prop, callback, scannedNodes);
            });
        }
    }
    else if (t.isObjectProperty(path.node)) {
        const value = path.get("value");
        if (value && !Array.isArray(value)) {
            searchStringLiterals(value, callback, scannedNodes);
        }
    }
    else if (t.isArrayExpression(path.node)) {
        const elements = path.get("elements");
        if (Array.isArray(elements)) {
            elements.forEach(element => {
                searchStringLiterals(element, callback, scannedNodes);
            });
        }
    }
    else if (t.isSwitchStatement(path.node)) {
        const cases = path.get("cases");
        if (Array.isArray(cases)) {
            cases.forEach(c => {
                searchStringLiterals(c, callback, scannedNodes);
            });
        }
    }
    else if (t.isSwitchCase(path.node)) {
        const consequent = path.get("consequent");
        if (Array.isArray(consequent)) {
            consequent.forEach(c => {
                if (t.isReturnStatement(c.node)) {
                    searchStringLiterals(c, callback, scannedNodes);
                }
            });
        }
    }
    else if (t.isFunctionDeclaration(path.node)) {
        const body = path.get("body");
        if (body && !Array.isArray(body)) {
            searchStringLiterals(body, callback, scannedNodes);
        }
    }
    else if (t.isForStatement(path.node)) {
        const body = path.get("body");
        if (body && !Array.isArray(body)) {
            searchStringLiterals(body, callback, scannedNodes);
        }
    }
    else if (t.isExpressionStatement(path.node)) {
        const expression = path.get("expression");
        if (expression && !Array.isArray(expression)) {
            searchStringLiterals(expression, callback, scannedNodes);
        }
    }
    else if (t.isAssignmentExpression(path.node)) {
        const right = path.get("right");
        if (right && !Array.isArray(right)) {
            searchStringLiterals(right, callback, scannedNodes);
        }
    }
    else if (t.isWhileStatement(path.node)) {
        const body = path.get("body");
        if (body && !Array.isArray(body)) {
            searchStringLiterals(body, callback, scannedNodes);
        }
    }
    else if (t.isSpreadElement(path.node)) {
        const argument = path.get("argument");
        if (argument && !Array.isArray(argument)) {
            searchStringLiterals(argument, callback, scannedNodes);
        }
    }
    else if (t.isArrowFunctionExpression(path.node)) {
        const body = path.get("body");
        if (body && !Array.isArray(body)) {
            searchStringLiterals(body, callback, scannedNodes);
        }
    }
    else if (t.isTryStatement(path.node)) {
        const block = path.get("block");
        const handler = path.get("handler");
        if (block && !Array.isArray(block)) {
            searchStringLiterals(block, callback, scannedNodes);
        }
        if (handler && !Array.isArray(handler)) {
            const handlerBody = handler.get("body");
            if (handlerBody && !Array.isArray(handlerBody)) {
                searchStringLiterals(handlerBody, callback, scannedNodes);
            }
        }
    }
    else {
        path.traverse({
            Identifier(innerPath) {
                searchStringLiterals(innerPath, callback, scannedNodes);
            },
        });
    }
    return path;
}
exports.searchStringLiterals = searchStringLiterals;
