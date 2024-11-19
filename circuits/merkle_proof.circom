pragma circom 2.0.0;

include "../node_modules/circomlib/circuits/poseidon.circom";
include "../node_modules/circomlib/circuits/mux1.circom";

template MerkleProof(levels) {
    signal input leaf;
    signal input pathElements[levels];
    signal input pathIndices[levels];
    signal input root;
    
    // 중간 계산값을 저장할 signal들
    signal hash[levels + 1];
    
    hash[0] <== leaf;
    
    component hashers[levels];
    component mux[levels][2];  // 각 레벨마다 2개의 MUX 필요
    
    for (var i = 0; i < levels; i++) {
        // 왼쪽 입력을 위한 MUX
        mux[i][0] = Mux1();
        mux[i][0].s <== pathIndices[i];
        mux[i][0].c[0] <== hash[i];
        mux[i][0].c[1] <== pathElements[i];
        
        // 오른쪽 입력을 위한 MUX
        mux[i][1] = Mux1();
        mux[i][1].s <== pathIndices[i];
        mux[i][1].c[0] <== pathElements[i];
        mux[i][1].c[1] <== hash[i];
        
        // Poseidon 해시 계산
        hashers[i] = Poseidon(2);
        hashers[i].inputs[0] <== mux[i][0].out;
        hashers[i].inputs[1] <== mux[i][1].out;
        hash[i + 1] <== hashers[i].out;
    }
    
    // 루트 검증
    root === hash[levels];
}

component main = MerkleProof(20);