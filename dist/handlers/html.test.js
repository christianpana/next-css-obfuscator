"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const html_1 = require("./html");
(0, vitest_1.describe)("findHtmlTagContentsByClass", () => {
    const content = `<body><div class="test1 test2">12345678<div class="test1">901234</div>56789</div><div class="test1 test3">0123456</div></body>`;
    (0, vitest_1.it)("should return the correct content within the tag that with a given class", () => {
        const targetClass = "test1";
        const expectedOutput = ['<div class="test1 test2">12345678<div class="test1">901234</div>56789</div>'];
        const result = (0, html_1.findHtmlTagContentsByClass)(content, targetClass);
        (0, vitest_1.expect)(result).toEqual(expectedOutput);
    });
    (0, vitest_1.it)("should return empty array if no content found", () => {
        const targetClass = "test5";
        const expectedOutput = [];
        const result = (0, html_1.findHtmlTagContentsByClass)(content, targetClass);
        (0, vitest_1.expect)(result).toEqual(expectedOutput);
    });
});
(0, vitest_1.describe)("obfuscateHtmlClassNames", () => {
    (0, vitest_1.it)("should obfuscate class names correctly", () => {
        const html = `<div class="foo"></div>`;
        const selectorConversion = { ".foo": ".a" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="a"></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
    (0, vitest_1.it)("should handle nested tags with obfuscate class", () => {
        const html = `<div class="key"><span class="foo"></span><span class="foo"></span></div>`;
        const selectorConversion = { ".foo": ".a" };
        const keyClass = "key";
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion, obfuscateMarkerClass: keyClass });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="key"><span class="a"></span><span class="a"></span></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
    (0, vitest_1.it)("should not obfuscate class names outside of obfuscate class scope", () => {
        const html = `<div class="foo"><span class="bar"></span></div>`;
        const selectorConversion = { ".foo": ".a", ".bar": ".b" };
        const keyClass = "key";
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion, obfuscateMarkerClass: keyClass });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="foo"><span class="bar"></span></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([]);
    });
    (0, vitest_1.it)("should handle script tags", () => {
        const html = `<script>self.__next_f.push({\\"className\\":\\"fol foo\\",})</script>`;
        const selectorConversion = { ".fol": ".a", ".foo": ".b" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion, obfuscateMarkerClass: "" });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<script>self.__next_f.push({\\"className\\":\\"a b\\",})</script>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".fol", ".foo"]);
    });
    (0, vitest_1.it)("should handle void tags", () => {
        const html = `<img class="foo" />`;
        const selectorConversion = { ".foo": ".a" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<img class="a" />`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
    (0, vitest_1.it)("should handle comments", () => {
        const html = `<!-- This is a comment --><div class="foo"></div>`;
        const selectorConversion = { ".foo": ".a" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<!-- This is a comment --><div class="a"></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
    (0, vitest_1.it)("should handle HTML without classes", () => {
        const html = "<div></div>";
        const selectorConversion = {};
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual("<div></div>");
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([]);
    });
    (0, vitest_1.it)("should handle empty HTML", () => {
        const html = "";
        const selectorConversion = { ".foo": ".a" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual("");
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([]);
    });
    (0, vitest_1.it)("should handle HTML with multiple classes in one element", () => {
        const html = `<div class="foo bar baz"></div>`;
        const selectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="a b c"></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
    });
    (0, vitest_1.it)("should handle HTML with nested structures and multiple classes", () => {
        const html = `<div class="foo"><span class="bar"><i class="baz"></i></span></div>`;
        const selectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="a"><span class="b"><i class="c"></i></span></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
    });
    (0, vitest_1.it)("should handle HTML with obfuscate marker class", () => {
        const html = `<div class="key"><span class="foo"></span><span class="foo"></span></div>`;
        const selectorConversion = { ".foo": ".a" };
        const obfuscateMarkerClass = "key";
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion, obfuscateMarkerClass });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="key"><span class="a"></span><span class="a"></span></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
    (0, vitest_1.it)("should handle HTML with multiple classes and obfuscate marker class", () => {
        const html = `<div class="key foo bar baz"></div>`;
        const selectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };
        const obfuscateMarkerClass = "key";
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion, obfuscateMarkerClass });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<div class="key a b c"></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
    });
    (0, vitest_1.it)("should handle HTML instruction", () => {
        const html = `<!DOCTYPE html><div class="foo"></div>`;
        const selectorConversion = { ".foo": ".a" };
        const result = (0, html_1.obfuscateHtmlClassNames)({ html, selectorConversion });
        (0, vitest_1.expect)(result.obfuscatedContent).toEqual(`<!DOCTYPE html><div class="a"></div>`);
        (0, vitest_1.expect)(result.usedKeys).to.deep.equal([".foo"]);
    });
});
