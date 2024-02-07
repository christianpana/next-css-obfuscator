import {
  findContentBetweenMarker,
  getFilenameFromPath,
  getRandomString,
  simplifyString,
} from "./utils";
import NumberGenerator from "recoverable-random";


//! ================================
//! findContentBetweenMarker
//! ================================

describe("findContentBetweenMarker", () => {

  it("should return the correct content between markers", () => {
    const content = `123{{4}5{67}8}901{2345678}9`;
    const targetStr = '5';
    const openSymbol = '{';
    const closeSymbol = '}';

    const expectedOutput = ["{4}5{67}8", "2345678"];

    const result = findContentBetweenMarker(content, targetStr, openSymbol, closeSymbol);
    expect(result).toEqual(expectedOutput);
  });

  // it('should return the correct content between (if marker length > 1)', () => {
  //     const content = '[Hello_0 [[Hello_1]]! Hello_2 [[Hello_3]]!]';
  //     const targetStr = 'He';
  //     const openSymbol = '[[';
  //     const closeSymbol = ']]';

  //     const expectedOutput = ['Hello_1', 'Hello_3'];

  //     const result = findContentBetweenMarker(content, targetStr, openSymbol, closeSymbol);
  //     expect(result).toEqual(expectedOutput);
  // });
});



//! ================================
//! getFilenameFromPath
//! ================================

describe("getFilenameFromPath", () => {

  test("should extract filename from a Unix-like path", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/report.pdf");

    // Assert
    expect(result).toBe("report.pdf");
  });

  test("should extract filename from a Windows-like path", () => {
    // Act
    const result = getFilenameFromPath("C:\\Users\\hokin\\report.pdf");

    // Assert
    expect(result).toBe("report.pdf");
  });

  test("should handle filenames without an extension", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/notes");

    // Assert
    expect(result).toBe("notes");
  });

  test("should handle paths with multiple periods", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/report.v1.0.pdf");

    // Assert
    expect(result).toBe("report.v1.0.pdf");
  });

  test("should handle paths with no directory", () => {
    // Act
    const result = getFilenameFromPath("report.pdf");

    // Assert
    expect(result).toBe("report.pdf");
  });

  test("should handle empty strings", () => {
    // Act
    const result = getFilenameFromPath("");

    // Assert
    expect(result).toBe("");
  });

  test("should handle paths with only directories and no filename", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/");

    // Assert
    expect(result).toBe("");
  });

  test("should handle paths with special characters in the filename", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/~$!%20report.pdf");

    // Assert
    expect(result).toBe("~$!%20report.pdf");
  });

  test("should handle paths with a dot at the start", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/.env");

    // Assert
    expect(result).toBe(".env");
  });

  test("should handle paths with a space in the filename", () => {
    // Act
    const result = getFilenameFromPath("/home/user/documents/my report.pdf");

    // Assert
    expect(result).toBe("my report.pdf");
  });

  test("should throw an error for non-string inputs", () => {
    // Arrange
    const input: any = null;

    // Act and Assert
    expect(() => getFilenameFromPath(input)).toThrow(TypeError);
  });

});

//! ================================
//! getRandomString
//! ================================

describe("getRandomString", () => {
  let rng: NumberGenerator;

  beforeEach(() => {
    rng = new NumberGenerator();
  });

  test("should generate a random string of a given length", () => {
    // Arrange
    const length = 10;
    const seed = "testSeed";
    rng = new NumberGenerator(seed); // Mocked RNG for consistent results

    // Act
    const result = getRandomString(length, seed);

    // Assert
    expect(result.randomString).toHaveLength(length);
    expect(result.randomString).toMatch(/^[a-z][a-z0-9-_]+$/);
  });

  test("should recover RNG state if state code is provided", () => {
    // Arrange
    const length = 10;
    const seed = "testSeed";
    const stateCode = "someStateCode";
    rng = new NumberGenerator(seed); // Mocked RNG for consistent results
    const initialStateCode = rng.getStateCode();

    // Act
    const result = getRandomString(length, seed, stateCode);

    // Assert
    expect(result.rngStateCode).not.toBe(initialStateCode);
  });

  test("should throw an error if length is not a positive integer", () => {
    // Arrange
    const invalidLengths = [0, -1, 1.5, NaN, Infinity];

    // Act & Assert
    invalidLengths.forEach(length => {
      expect(() => getRandomString(length as any)).toThrow();
    });
  });

  test("should handle edge case where length is 1", () => {
    // Arrange
    const length = 1;

    // Act
    const result = getRandomString(length);

    // Assert
    expect(result.randomString).toHaveLength(length);
    expect(result.randomString).toMatch(/^[a-z]$/);
  });

  test("should return a valid rngStateCode", () => {
    // Arrange
    const length = 10;

    // Act
    const result = getRandomString(length);

    // Assert
    expect(result.rngStateCode).toBeDefined();
    expect(typeof parseInt(result.rngStateCode)).toBe("number");
  });
});

//! ================================
//! simplifyString
//! ================================

describe("simplifyString", () => {
  let rng: NumberGenerator;

  beforeEach(() => {
    rng = new NumberGenerator("default-seed");
  });

  test("should throw an error for empty string", () => {
    // Act & Assert
    expect(() => simplifyString("")).toThrow("String can not be empty");
  });

  test("should return a simplified string and rng state code", () => {
    // Arrange
    const input = "a1e2i3o4u5w6_-";

    // Act
    const result = simplifyString(input, "seed");

    // Assert
    expect(result.randomString.length).toBeLessThan(input.length);
    expect(typeof parseInt(result.rngStateCode)).toBe("number");
  });

  test("should recover RNG state from state code", () => {
    // Arrange
    const stateCode = "some-state-code";
    const input = "test";
    rng.recoverState(stateCode);
    const expectedStateCode = rng.getStateCode();

    // Act
    const result = simplifyString(input, undefined, stateCode);

    // Assert
    expect(result.rngStateCode).toBe(expectedStateCode);
  });

  test("should handle strings without vowels or numbers", () => {
    // Arrange
    const input = "bcdfghjklmnpqrstvxyz";
    const expectedOutput = input; // No vowels or numbers to remove

    // Act
    const result = simplifyString(input, "seed");

    // Assert
    expect(result.randomString).toBe(expectedOutput);
  });

  test("should handle strings with only vowels and numbers", () => {
    // Arrange
    const input = "aeiou12345";
    const expectedOutput = ""; // All characters should be removed

    // Act
    const result = simplifyString(input, "seed");
    console.log(result);

    // Assert
    expect(result.randomString).toHaveLength(1); // Should contain one random character
  });
});
