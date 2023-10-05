const commandExists = require("command-exists");
const fs = require("fs");
const { spawnSync } = require("child_process");
const { AssertionError } = require("chai");

async function runNargoCheck() {
    // Check nargo exists
    if (!commandExists.sync("nargo")) {
        throw new AssertionError("command not found: nargo");
    }

    // Check for compile error
    const result = spawnSync("nargo", ["check"] );
    if (result.status != 0) {
        throw new AssertionError(result.stderr.toString());
    }

    // Check that tests not modified
    const mainSrc = fs.readFileSync("src/main.nr", "utf-8").replaceAll(/\s+/g," ");
    const prefix = "mod tests; // Do not modify this first line!"

    if (!mainSrc.startsWith(prefix)) {
        throw new AssertionError("First line of main.nr modified!");
    }
}

function runNargoTest(testFile, testName) {
    const testPath = `tests::${testFile}::${testName}`;
    const result = spawnSync("nargo", ["test", testPath] );

    if (result.status != 0) {
        throw new AssertionError(result.stderr.toString());
    }
}

module.exports = {
    runNargoCheck,
    runNargoTest
};