// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IDaggerSpell.sol";

contract DaggerSpell is IDaggerSpell {
    
    constructor(address[8] memory _keepers) { }

    /// @inheritdoc IDaggerSpell
    function merkleLeaf(uint256 _index) external view returns (bytes32) {

    }

    /// @inheritdoc IDaggerSpell
    function merkleRoot() external view returns (bytes32) {

    }

    /// @inheritdoc IDaggerSpell
    function daggers(address _keeper) external view returns (uint256) {

    }

    /// @inheritdoc IDaggerSpell
    function giveDagger(bytes32 _merkleLeaf) external {

    }

    /// @inheritdoc IDaggerSpell
    function computeRoot() external {

    }

    /// @inheritdoc IDaggerSpell
    function pullDagger(bytes32 _nullifier, bytes calldata _proof) external {

    }

}
