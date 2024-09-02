const { ethers } = require("hardhat");
const { expect } = require("chai");
const { execSync } = require("child_process");
const fs = require("fs");
let toml = require("toml");

// Takes raw proof and splits it into public inputs and proof as hex strings
function splitProof(proofBuffer) {
  const publicInputs = proofBuffer.subarray(0, 32 * 33);
  const proof = proofBuffer.subarray(32 * 33);

  return {
    publicInputs: "0x" + publicInputs.toString("hex"),
    proof: "0x" + proof.toString("hex")
  };

}

function testSpell(subsuiteType, dataPath) {
    
  let spell;
  let signers;

  let pullIndex;
  let validProof;
  let merkleTree;

  before(async function() {
    signers = await ethers.getSigners();

    // Read pull index
    let witnessData = fs.readFileSync(`${dataPath}/TestProver.toml`);
    let witness = toml.parse(witnessData);
    pullIndex = witness.index;

    // Read merkle tree
    let treeData = fs.readFileSync(`${dataPath}/merkleTree.json`);
    merkleTree = JSON.parse(treeData);

    // Compute proof
    execSync(`nargo execute -p ${dataPath}/TestProver.toml witness.gz`);
    execSync("bb prove -b ./target/daggers_and_decoys.json\
      -w ./target/witness.gz -o ./target/test_proof");

    // Read proof (and delete temp file)
    let proofData = fs.readFileSync("./target/test_proof");
    validProof = splitProof(proofData).proof;
  });

  beforeEach(async function () {

    let Spell = await ethers.getContractFactory("DaggerSpell");
    spell = await Spell.deploy(
      signers.slice(0, 8).map(k => k.address)
    );

  });

  describe(`${subsuiteType} Test 1`, function () {

    it("Should distribute daggers in constructor()", async function () {
      for (let i = 0; i < 8; i++) {
        const daggerCount = await spell.daggers(
          signers[i].address
        );

        expect(daggerCount).to.equal(1);
      }
    });

    it("Should giveDagger()", async function () {
      for (let i = 0; i < 8; i++) {
        await spell.connect(signers[i])
            .giveDagger(merkleTree.levels[3][i]);

        const daggerCount = await spell.daggers(
            signers[i].address
        );

        expect(daggerCount).to.equal(0, "Unexpected dagger count");
        
        expect(await spell.merkleLeaf(i))
          .to.equal(merkleTree.levels[3][i], `Unexpected merkleLeaf(${i})`)
      }
    });

    it("Should computeRoot()", async function () {
      for (let i = 0; i < 8; i++) {
        await spell.connect(signers[i])
          .giveDagger(merkleTree.levels[3][i]);
      }

      await spell.computeRoot();

      expect(await spell.merkleRoot()).to.equal(merkleTree.root);
    });

    it("Should pullDagger()", async function () {
      for (let i = 0; i < 8; i++) {
        await spell.connect(signers[i])
          .giveDagger(merkleTree.levels[3][i]);
      }

      await spell.computeRoot();

      const recipient = signers[8];
      await spell.connect(recipient)
        .pullDagger(merkleTree.nullifiers[pullIndex], validProof);

      const daggerCount = await spell.daggers(recipient.address);
      expect(daggerCount).to.equal(1);
    });

  });

  describe(`${subsuiteType} Test 2`, function () {

    it("Should throw error if not dagger keeper in giveDagger()", async function () {
      let tx = spell.connect(signers[8])
        .giveDagger(merkleTree.levels[3][0]);

      await expect(tx).to.be.revertedWith("NOT_KEEPER");
    });

    it("Should throw error if not enough leaves in computeRoot()", async function () {
      for (let i = 0; i < 4; i++) {
        await spell.connect(signers[i])
          .giveDagger(merkleTree.levels[3][i]);
      }

      let tx = spell.computeRoot();
      await expect(tx).to.be.revertedWith("NOT_ENOUGH_LEAVES");
    });

    it("Should reject replayed nullifier in pullDagger()", async function () {
      for (let i = 0; i < 8; i++) {
        await spell.connect(signers[i])
          .giveDagger(merkleTree.levels[3][i]);
      }

      await spell.computeRoot();

      await spell.connect(signers[8])
        .pullDagger(merkleTree.nullifiers[pullIndex], validProof)

      let tx = spell.connect(signers[8])
        .pullDagger(merkleTree.nullifiers[pullIndex], validProof);

      await expect(tx).to.be.revertedWith("REPLAYED_NULLIFIER");
    });

      it("Should reject invalid proof in pullDagger()", async function () {
        for (let i = 0; i < 8; i++) {
          await spell.connect(signers[i])
            .giveDagger(merkleTree.levels[3][i]);
        }
  
        await spell.computeRoot();

        const invalidNullifier = ethers.utils.randomBytes(32);
        const tx = spell.connect(signers[8])
          .pullDagger(invalidNullifier, validProof);

        await expect(tx).to.be.revertedWith("INVALID_PROOF");
      });
  });
}

module.exports.testSpell = testSpell;