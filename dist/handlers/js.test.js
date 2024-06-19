"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const js_1 = require("./js");
(0, vitest_1.describe)("searchForwardComponent", () => {
    (0, vitest_1.test)("should return component name when jsx format is correct", () => {
        const content = `const element = o.jsx(ComponentName, {data: dataValue, index: "date"});`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["ComponentName"]);
    });
    (0, vitest_1.test)("should return multiple component names for multiple matches", () => {
        const content = `o.jsx(FirstComponent, props); o.jsx(SecondComponent, otherProps);`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["FirstComponent", "SecondComponent"]);
    });
    (0, vitest_1.test)("should return an empty array when no component name is found", () => {
        const content = `o.jsx("h1", {data: dataValue, index: "date"});`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.test)("should return an empty array when content is empty", () => {
        const content = "";
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.test)("should return an empty array when jsx is not used", () => {
        const content = `const element = React.createElement("div", null, "Hello World");`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.test)("should handle special characters in component names", () => {
        const content = `o.jsx($Comp_1, props); o.jsx(_Comp$2, otherProps);`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["$Comp_1", "_Comp$2"]);
    });
    (0, vitest_1.test)("should not return component names when they are quoted", () => {
        const content = `o.jsx("ComponentName", props); o.jsx('AnotherComponent', otherProps);`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual([]);
    });
    (0, vitest_1.test)("should return component names when they are followed by a brace", () => {
        const content = `o.jsx(ComponentName, {props: true});`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["ComponentName"]);
    });
    (0, vitest_1.test)("should handle content with line breaks and multiple jsx calls", () => {
        const content = `
      o.jsx(FirstComponent, {data: dataValue});
      o.jsx(SecondComponent, {index: "date"});
      o.jsx(ThirdComponent, {flag: true});
    `;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["FirstComponent", "SecondComponent", "ThirdComponent"]);
    });
    (0, vitest_1.test)("should handle content with nested jsx calls", () => {
        const content = `o.jsx(ParentComponent, {children: o.jsx(ChildComponent, {})})`;
        const result = (0, js_1.searchForwardComponent)(content);
        (0, vitest_1.expect)(result).toEqual(["ParentComponent", "ChildComponent"]);
    });
});
