pragma circom 2.0.0;

template ArithmeticExample() {
    signal input a;
    signal input b;
    signal input c;
    
    // 중간 계산
    signal ab;
    signal bc;
    signal intermediate1;
    signal intermediate2;
    signal bb;  // b * b
    
    // 출력
    signal output result;
    
    // 이차 제약 조건으로 분리
    ab <== a * b;
    bc <== b * c;
    intermediate1 <== ab + bc;
    
    bb <== b * b;
    intermediate2 <== intermediate1 * a + bb;
    result <== intermediate2 + c;
}

component main = ArithmeticExample();