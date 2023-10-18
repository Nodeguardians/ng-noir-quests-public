const { ethers } = require("hardhat");
const { expect } = require("chai");
const { execSync } = require("child_process");
const fs = require("fs");
let toml = require("toml");

function testMixer(subsuiteType, dataPath) {
    
    let mixer;
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

        if (fs.existsSync(`${dataPath}/test.proof`)) {
            // Use proof if pre-generated
            validProof = "0x" + fs.readFileSync(`${dataPath}/test.proof`).toString();
        } else {
            // Else compute proof (in a temp file)
            execSync(
                `nargo prove \
                -p ${dataPath}/TestProver.toml \
                -v ${dataPath}/TestVerifier.toml`
            );
            
            // Read proof (and delete temp file)
            let proofData = fs.readFileSync("./proofs/daggers_and_decoys.proof");
            fs.rmSync("./proofs/daggers_and_decoys.proof");
            
            validProof = "0x" + proofData.toString();
        }
    });

    beforeEach(async function () {

        let Mixer = await ethers.getContractFactory("DaggerMixer");
        mixer = await Mixer.deploy(
            signers.slice(0, 8).map(k => k.address)
        );

    });

    describe(`${subsuiteType} Test 1`, function () {

        it("Should distribute daggers in constructor()", async function () {
            for (let i = 0; i < 8; i++) {
                const daggerCount = await mixer.daggers(
                    signers[i].address
                );

                expect(daggerCount).to.equal(1);
            }
        });

        it("Should giveDagger()", async function () {
            for (let i = 0; i < 8; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);

                const daggerCount = await mixer.daggers(
                    signers[i].address
                );

                expect(daggerCount).to.equal(0);
            }
        });

        it("Should computeRoot()", async function () {
            for (let i = 0; i < 8; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);
            }

            await mixer.computeRoot();

            expect(await mixer.merkleRoot()).to.equal(merkleTree.root);
        });

        it("Should pullDagger()", async function () {
            for (let i = 0; i < 8; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);
            }

            await mixer.computeRoot();

            const recipient = signers[8];
            await mixer.connect(recipient)
                .pullDagger(merkleTree.nullifiers[pullIndex], validProof);

            const daggerCount = await mixer.daggers(recipient.address);
            expect(daggerCount).to.equal(1);
        });

    });

    describe(`${subsuiteType} Test 2`, function () {

        it("Should throw error if not dagger keeper in giveDagger()", async function () {
            let tx = mixer.connect(signers[8])
                .giveDagger(merkleTree.levels[3][0]);

            await expect(tx).to.be.revertedWith("NOT_KEEPER");
        });

        it("Should throw error if not enough leaves in computeRoot()", async function () {
            for (let i = 0; i < 4; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);
            }

            let tx = mixer.computeRoot();
            await expect(tx).to.be.revertedWith("NOT_ENOUGH_LEAVES");
        });

        it("Should reject replayed nullifier in pullDagger()", async function () {
            for (let i = 0; i < 8; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);
            }
    
            await mixer.computeRoot();
    
            await mixer.connect(signers[8])
                .pullDagger(merkleTree.nullifiers[pullIndex], validProof)
    
            let tx = mixer.connect(signers[8])
                .pullDagger(merkleTree.nullifiers[pullIndex], validProof);
    
            await expect(tx).to.be.revertedWith("REPLAYED_NULLIFIER");
        });

        it("Should reject invalid proof in pullDagger()", async function () {
            for (let i = 0; i < 8; i++) {
                await mixer.connect(signers[i])
                    .giveDagger(merkleTree.levels[3][i]);
            }
    
            await mixer.computeRoot();

            const invalidNullifier = ethers.utils.randomBytes(32);
            const tx = mixer.connect(signers[8])
                .pullDagger(invalidNullifier, validProof);
    
            await expect(tx).to.be.revertedWith("INVALID_PROOF");
        });
    });
}

module.exports.testMixer = testMixer;