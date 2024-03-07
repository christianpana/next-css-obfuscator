import { describe, it, expect } from "vitest";

import { SelectorConversion } from '../types';

import {
  findHtmlTagContentsByClass,
  obfuscateHtmlClassNames,
} from "./html";


//! ================================
//! findHtmlTagContentsByClass
//! ================================

//! deprecated
describe("findHtmlTagContentsByClass", () => {
  const content = `<body><div class="test1 test2">12345678<div class="test1">901234</div>56789</div><div class="test1 test3">0123456</div></body>`;

  it("should return the correct content within the tag that with a given class", () => {
    const targetClass = "test1";

    const expectedOutput = ['<div class="test1 test2">12345678<div class="test1">901234</div>56789</div>'];

    const result = findHtmlTagContentsByClass(content, targetClass);
    expect(result).toEqual(expectedOutput);
  });

  it("should return empty array if no content found", () => {
    const targetClass = "test5";

    const expectedOutput: any[] = [];

    const result = findHtmlTagContentsByClass(content, targetClass);
    expect(result).toEqual(expectedOutput);
  });
});

//! ================================
//! obfuscateHtmlClassNames
//! ================================

describe("obfuscateHtmlClassNames", () => {

  it("should obfuscate class names correctly", () => {
    // Arrange
    const html = `<div class="foo"></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a" };

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="a"></div>`);
    expect(result.usedKeys).to.deep.equal([".foo"]);
  });

  it("should handle nested tags with obfuscate class", () => {
    // Arrange
    const html = `<div class="key"><span class="foo"></span><span class="foo"></span></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a" };
    const keyClass = "key";

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion, keyClass);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="key"><span class="a"></span><span class="a"></span></div>`);
    expect(result.usedKeys).to.deep.equal([".foo"]);
  });

  it("should not obfuscate class names outside of obfuscate class scope", () => {
    // Arrange
    const html = `<div class="foo"><span class="bar"></span></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a", ".bar": ".b" };
    const keyClass = "key";

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion, keyClass);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="foo"><span class="bar"></span></div>`);
    expect(result.usedKeys).to.deep.equal([]);
  });

  it("should handle self-closing tags", () => {
    // Arrange
    const html = `<img class="foo" />`;
    const selectorConversion: SelectorConversion = { ".foo": ".a" };

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<img class="a"></img>`);
    expect(result.usedKeys).to.deep.equal([".foo"]);
  });

  it("should handle HTML without classes", () => {
    // Arrange
    const html = "<div></div>";
    const selectorConversion: SelectorConversion = {};

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion);

    // Assert
    expect(result.obfuscatedContent).toEqual("<div></div>");
    expect(result.usedKeys).to.deep.equal([]);
  });

  it("should handle empty HTML", () => {
    // Arrange
    const html = "";
    const selectorConversion: SelectorConversion = { ".foo": ".a" };

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion);

    // Assert
    expect(result.obfuscatedContent).toEqual("");
    expect(result.usedKeys).to.deep.equal([]);
  });

  it("should handle HTML with multiple classes in one element", () => {
    // Arrange
    const html = `<div class="foo bar baz"></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="a b c"></div>`);
    expect(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
  });

  it("should handle HTML with nested structures and multiple classes", () => {
      // Arrange
      const html = `<div class="foo"><span class="bar"><i class="baz"></i></span></div>`;
      const selectorConversion: SelectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };

      // Act
      const result = obfuscateHtmlClassNames(html, selectorConversion);

      // Assert
      expect(result.obfuscatedContent).toEqual(`<div class="a"><span class="b"><i class="c"></i></span></div>`);
      expect(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
  });

  it("should handle HTML with obfuscate marker class", () => {
    // Arrange
    const html = `<div class="key"><span class="foo"></span><span class="foo"></span></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a" };
    const obfuscateMarkerClass = "key";

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion, obfuscateMarkerClass);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="key"><span class="a"></span><span class="a"></span></div>`);
    expect(result.usedKeys).to.deep.equal([".foo"]);
  });

  it("should handle HTML with multiple classes and obfuscate marker class", () => {
    // Arrange
    const html = `<div class="key foo bar baz"></div>`;
    const selectorConversion: SelectorConversion = { ".foo": ".a", ".bar": ".b", ".baz": ".c" };
    const obfuscateMarkerClass = "key";

    // Act
    const result = obfuscateHtmlClassNames(html, selectorConversion, obfuscateMarkerClass);

    // Assert
    expect(result.obfuscatedContent).toEqual(`<div class="key a b c"></div>`);
    expect(result.usedKeys).to.deep.equal([".foo", ".bar", ".baz"]);
  });
});