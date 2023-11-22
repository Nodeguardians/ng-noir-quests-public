// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IDaggerSpell {
    
    /// @notice Returns the specified leaf of the current merkle tree.
    /// @param _index Index of the leaf.
    function merkleLeaf(uint256 _index) external view returns (bytes32);

    /// @notice Returns the current merkle root if it has been computed.
    /// Else, return 0.
    function merkleRoot() external view returns (bytes32);

    /// @notice Returns the number of daggers owned by a specified address.
    /// @param _keeper The address to to query.
    function daggers(address _keeper) external view returns (uint256);

    /// @notice Has `msg.sender` give a dagger to the contract, alongside a hashed secret. 
    /// Should revert with "NOT_KEEPER" if `msg.sender` has no dagger.
    /// @param _merkleLeaf Hashed secret.
    function giveDagger(bytes32 _merkleLeaf) external;

    /// @notice Computes the merkle root given the 8 hashed secrets. 
    /// Should revert with `"NOT_ENOUGH_LEAVES"` if there are less than 8 hashed secrets.
    function computeRoot() external;

    /// @notice Transfers a dagger to `msg.sender`. 
    /// @param _nullifier Nullifier of secret.
    /// @param _proof zk-Proof of secret.
    /// @dev Should revert with "REPLAYED_NULLIFIER" if _nullifier has been spent
    /// and with "INVALID_PROOF" if _proof is invalid.
    function pullDagger(bytes32 _nullifier, bytes calldata _proof) external;

}

