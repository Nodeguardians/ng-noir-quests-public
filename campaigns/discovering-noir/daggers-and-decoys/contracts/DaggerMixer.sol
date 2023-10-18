// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./plonk_vk.sol";

contract DaggerMixer {
    
    bytes32 public merkleRoot;
    mapping(address => uint256) public daggers;
    
    constructor(address[8] memory _keepers) { }

    function giveDagger(bytes32 _merkleLeaf) external { }

    function computeRoot() external { }

    function pullDagger(bytes32 _nullifier, bytes calldata _proof) external { }

}

