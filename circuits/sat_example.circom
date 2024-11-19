pragma circom 2.0.0;

template SATExample() {
    signal input x1;
    signal input x2;
    signal input x3;
    
    signal output satisfied;
    
    // 입력값 검증
    x1 * (1 - x1) === 0;
    x2 * (1 - x2) === 0;
    x3 * (1 - x3) === 0;
    
    // CNF 식 (x1 ∨ x2) ∧ (¬x2 ∨ x3) ∧ (¬x1 ∨ ¬x3)
    signal clause1;
    signal clause2;
    signal clause3;
    signal temp1;
    signal temp2;
    
    clause1 <== x1 + x2 - x1 * x2;
    clause2 <== (1-x2) + x3 - (1-x2) * x3;
    clause3 <== (1-x1) + (1-x3) - (1-x1) * (1-x3);
    
    temp1 <== clause1 * clause2;
    satisfied <== temp1 * clause3;
}

component main = SATExample();