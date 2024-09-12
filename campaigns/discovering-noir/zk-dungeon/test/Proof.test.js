const { execSync } = require("child_process");
const { expect } = require("chai");
const fs = require("fs");
const exp = require("constants");

// Read nth public input from proof
function readPublicInput(proofBuffer, n) {
  const startByte = 32 * n;
  const encodedInput = proofBuffer.subarray(startByte, startByte + 32);

  return BigInt("0x" + encodedInput.toString("hex"));
}

describe("Proof of Path (Part 3)", function() {

  describe("Public Test 1", function() {

    it("Should exist", async function() {
      expect(
        fs.existsSync("./proofs/zk_dungeon"),
        `"./proofs/zk_dungeon" does not exist! Save your proof in the expected path.`
      ).to.be.true;
    });

    it("Should have correct public inputs", async function() {
      const proofBuffer = fs.readFileSync("./proofs/zk_dungeon");

      // Check watcher_map
      for (let i = 0; i < 64; i++) {
        let input = readPublicInput(proofBuffer, i);
        if (i == 43 || i == 57 || i == 60 || i == 61) {
          // Should have watcher
          expect(input, i).to.equal(1n);
        } else {
          // Should not have watcher
          expect(input, i).to.equal(0n);
        }
      }

      // Check dagger
      expect(readPublicInput(proofBuffer, 64)).to.equal(5n);
      expect(readPublicInput(proofBuffer, 65)).to.equal(4n);
    });

    it("Should be valid", async function() {
      execSync("nargo compile");
      execSync("bb write_vk -b ./target/zk_dungeon.json -o ./target/vk");
      execSync("bb verify -k ./target/vk -p ./proofs/zk_dungeon");
    });

  });

});
