// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./plonk_vk.sol";

contract ShroudedDagger {
    
    bytes32 public merkleRoot;
    mapping(address => uint256) public shards;
    
    constructor(address[] memory _shardKeepers) { }

    function giveShard(bytes32 _merkleLeaf) external { }

    function computeRoot() external { }

    function pullShard(bytes32 _nullifier, bytes calldata _proof) external { }

}

