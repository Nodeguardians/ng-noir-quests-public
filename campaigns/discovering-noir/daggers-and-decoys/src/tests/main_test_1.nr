use crate::main;

fn random_bytes32(seed: u8) -> [u8; 32]{
    let mut arr = [seed; 32];
    dep::std::hash::keccak256(arr, 32)
}

#[test]
fn test_main_valid_1() {

    let expected_root = [
        174, 98, 171, 176, 117, 155, 11, 210, 251, 248, 132, 123, 149, 255, 59, 194, 
        62, 118, 210, 113, 117, 31, 138, 211, 193, 141, 43, 158, 108, 20, 87, 204
    ];

    let nullifier = 1700199911647519160884079855180755239034300227611852437381051786319621592608;

    main(
        606,
        6,
        [random_bytes32(11), random_bytes32(22), random_bytes32(33)],
        expected_root,
        nullifier
    );

}

#[test]
fn test_main_valid_2() {

    let expected_root = [
        179, 124, 88, 169, 11, 174, 56, 40, 145, 51, 177, 119, 77, 174, 170, 205, 
        222, 95, 228, 187, 229, 207, 54, 172, 177, 173, 39, 2, 205, 162, 195, 213
    ];

    let nullifier = 19495997216440034695495124787917216210788259033346490508624412150028500445265;

    main(
        303,
        3,
        [random_bytes32(19), random_bytes32(29), random_bytes32(39)],
        expected_root,
        nullifier
    );

}

#[test(should_fail)]
fn test_main_invalid_root() {

    let invalid_root = [
        179, 124, 88, 169, 111, 174, 56, 40, 145, 51, 177, 119, 77, 174, 170, 205, 
        222, 95, 228, 187, 229, 207, 54, 172, 177, 173, 39, 2, 205, 162, 195, 213
    ];

    let nullifier = 19495997216440034695495124787917216210788259033346490508624412150028500445265;

    main(
        303,
        3,
        [random_bytes32(17), random_bytes32(27), random_bytes32(37)],
        invalid_root,
        nullifier
    );

}

#[test(should_fail)]
fn test_main_invalid_nullifier() {

    let expected_root = [
        174, 98, 171, 176, 117, 155, 11, 210, 251, 248, 132, 123, 149, 255, 59, 194, 
        62, 118, 210, 113, 117, 31, 138, 211, 193, 141, 43, 158, 108, 20, 87, 204
    ];

    let nullifier = 1700199911647519160884079805180755239034300227611852437381051786319621592608;

    main(
        606,
        6,
        [random_bytes32(11), random_bytes32(22), random_bytes32(33)],
        expected_root,
        nullifier
    );

}