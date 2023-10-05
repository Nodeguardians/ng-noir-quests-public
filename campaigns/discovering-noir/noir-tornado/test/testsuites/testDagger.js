const { ethers } = require("hardhat");
const { expect } = require("chai");
const { execSync } = require("child_process");
const fs = require("fs");
let toml = require("toml");

function testDagger(subsuiteType, dataPath) {
    
    let dagger;
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

        // Compute proof in temp file
        execSync(
            `nargo prove \
            -p ${dataPath}/TestProver.toml \
            -v ${dataPath}/TestVerifier.toml`
        );
        
        // Read proof (and delete temp file)
        let proofData = fs.readFileSync("./proofs/noir_tornado.proof");
        fs.rmSync("./proofs/noir_tornado.proof");
        
        validProof = "0x" + proofData.toString();

    });

    beforeEach(async function () {

        let Dagger = await ethers.getContractFactory("ShroudedDagger");
        dagger = await Dagger.deploy(
            signers.slice(0, 8).map(k => k.address)
        );

    });

    describe(`${subsuiteType} Test 1`, function () {

        it("Should distribute shards in constructor()", async function () {
            for (let i = 0; i < 8; i++) {
                const shardCount = await dagger.shards(
                    signers[i].address
                );

                expect(shardCount).to.equal(1);
            }
        });

        it("Should giveShard()", async function () {
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);

                const shardCount = await dagger.shards(
                    signers[i].address
                );

                expect(shardCount).to.equal(0);
            }
        });

        it("Should computeRoot()", async function () {
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }

            await dagger.computeRoot();

            expect(await dagger.merkleRoot()).to.equal(merkleTree.root);
        });

        it("Should pullShard()", async function () {
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }

            await dagger.computeRoot();

            const recipient = signers[8];
            await dagger.connect(recipient)
                .pullShard(merkleTree.nullifiers[pullIndex], validProof);

            const shardCount = await dagger.shards(recipient.address);
            expect(shardCount).to.equal(1);
        });

    });

    describe(`${subsuiteType} Test 2`, function () {

        it("Should throw error if too many leaves in giveShard()", async function () {
            let Dagger = await ethers.getContractFactory("ShroudedDagger");
            dagger = await Dagger.deploy(
                signers.slice(0, 9).map(k => k.address)
            );
    
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }
    
            let tx = dagger.connect(signers[8])
                .giveShard(ethers.utils.randomBytes(32));
            
            await expect(tx).to.be.revertedWith("TOO_MANY_LEAVES");
        });

        it("Should throw error if not enough leaves in computeRoot()", async function () {
            for (let i = 0; i < 4; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }

            let tx = dagger.computeRoot();
            await expect(tx).to.be.revertedWith("NOT_ENOUGH_LEAVES");
        });

        it("Should reject replayed nullifier in pullShard()", async function () {
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }
    
            await dagger.computeRoot();
    
            await dagger.connect(signers[8])
                .pullShard(merkleTree.nullifiers[pullIndex], validProof)
    
            let tx = dagger.connect(signers[8])
                .pullShard(merkleTree.nullifiers[pullIndex], validProof);
    
            await expect(tx).to.be.revertedWith("REPLAYED_NULLIFIER");
        });

        it("Should reject invalid proof in pullShard()", async function () {
            for (let i = 0; i < 8; i++) {
                await dagger.connect(signers[i])
                    .giveShard(merkleTree.levels[3][i]);
            }
    
            await dagger.computeRoot();

            const invalidNullifier = ethers.utils.randomBytes(32);
            const tx = dagger.connect(signers[8])
                .pullShard(invalidNullifier, validProof);
    
            await expect(tx).to.be.revertedWith("INVALID_PROOF");
        });
    });
}

module.exports.testDagger = testDagger;