const { runNargoTest, runNargoCheck } = require("./testsuites/testNoir.js");

describe("Noir Circuit (Part 2)", function() {

  const testFile = "main_test_1";

  before(async function() {
    await runNargoCheck();
  });

  describe("Public Test 1", function() {

    it("Should allow valid input", async function() {
      runNargoTest(testFile, "test_main_valid_1");
      runNargoTest(testFile, "test_main_valid_2");
    });

  });

  describe("Public Test 2", function() {

  it("Should flag invalid root", async function() {
    runNargoTest(testFile, "test_main_invalid_root");
  });

  it("Should flag invalid nullifier", async function() {
    runNargoTest(testFile, "test_main_invalid_nullifier");
  });
    
  });

});
