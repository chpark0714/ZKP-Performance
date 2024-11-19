pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";

template HashCheck() {
    signal input preimage[2];
    signal input hash;
    
    component hasher = Poseidon(2);
    hasher.inputs[0] <== preimage[0];
    hasher.inputs[1] <== preimage[1];
    
    signal output computed_hash;
    computed_hash <== hasher.out;
    
    hash === computed_hash;
}

component main = HashCheck();