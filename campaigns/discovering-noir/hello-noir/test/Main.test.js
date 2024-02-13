const { runNargoTest, runNargoCheck } = require("./testsuites/testNoir.js");

describe("Simple Noir Spell (Part 2)", function() {

  before(async function() {
    await runNargoCheck();
  });

  describe("Public Test 1", function() {

    it("Should pass tests in main_test.nr", async function() {
      runNargoTest("main_test");
    });

  });

});
