const fs = require("fs");
const { spawnSync } = require("child_process");
const { expect } = require("chai");

async function runNargoCheck() {
  // Check for compile error
  const result = spawnSync("nargo", ["check"] );
  expect(result.status).to.equal(0, result.stderr.toString());

  // Check that tests not modified
  const mainSrc = fs.readFileSync("src/main.nr", "utf-8").replaceAll(/\s+/g," ");
  const prefix = "mod tests; // Do not modify this first line!"

  expect(mainSrc.startsWith(prefix))
    .to.equal(true, "First line of main.nr modified!");
}

function runNargoTest(testName) {
  const testPath = `tests::${testName}`;
  const result = spawnSync("nargo", ["test", testPath] );

  expect(result.status).to.equal(0, "\n"  + result.stderr.toString());
}

module.exports = {
  runNargoCheck,
  runNargoTest
};