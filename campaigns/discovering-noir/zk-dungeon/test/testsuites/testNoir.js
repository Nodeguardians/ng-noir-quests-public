const { spawnSync } = require("child_process");
const { AssertionError } = require("chai");

async function runNargoCheck() {
    // Check for compile error
    const result = spawnSync("nargo", ["check"] );
    if (result.status != 0) {
        throw new AssertionError(result.stderr.toString());
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