const { execSync, exec } = require("child_process");
const { expect } = require("chai");
const fs = require("fs");

// Read nth public input from proof
function readPublicInput(proofBuffer, n) {
  const startByte = 32 * n;
  const encodedInput = proofBuffer.subarray(startByte, startByte + 32);

  return BigInt("0x" + encodedInput.toString("hex"));
}

describe("Proof of Key (Part 3)", function() {

  describe("Public Test 1", function() {

    it("Should exist", async function() {
      expect(
        fs.existsSync("./proofs/hello_noir"),
        `"./proofs/hello_noir" does not exist! Save your proof in the expected path.`
      ).to.be.true;
    });

    it("Should have correct public inputs", async function() {
      const proofBuffer = fs.readFileSync("./proofs/hello_noir");

      expect(readPublicInput(proofBuffer, 0)).to.equal(187n);
      expect(readPublicInput(proofBuffer, 1)).to.equal(459n);
    });

    it("Should be valid", async function() {
      execSync("nargo compile");
      execSync("bb write_vk -b ./target/hello_noir.json -o ./target/vk");
      execSync("bb verify -k ./target/vk -p ./proofs/hello_noir");
    });

  });

});
