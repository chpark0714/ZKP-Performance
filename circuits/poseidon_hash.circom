pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template PoseidonHash() {
    signal input in[2];
    signal output hash;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== in[0];
    hasher.inputs[1] <== in[1];
    
    hash <== hasher.out;
}

component main = PoseidonHash(); 