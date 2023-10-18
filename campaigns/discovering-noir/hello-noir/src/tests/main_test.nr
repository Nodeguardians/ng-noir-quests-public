use crate::main;

#[test]
fn test_valid_key() {
    main(11, 33, 99);
    main(15, 30, 105);
    main(4, 144, 20);
}

#[test(should_fail)]
fn test_invalid_key_value() {
    main(1, 5, 21);
}

#[test(should_fail)]
fn test_invalid_key_for_lock_1() {
    main(7, 10, 21);
}

#[test(should_fail)]
fn test_invalid_key_for_lock_2() {
    main(16, 48, 2);
}