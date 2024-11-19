pragma circom 2.0.0;

template BooleanExample() {
    signal input a;
    signal input b;
    signal input c;
    
    signal output result;
    
    // 입력값 검증 (0 또는 1)
    a * (1 - a) === 0;
    b * (1 - b) === 0;
    c * (1 - c) === 0;
    
    // AND, OR, NOT 연산 구현
    signal and_result;
    signal or_temp;
    signal not_result;
    signal final_temp1;
    signal final_temp2;
    
    and_result <== a * b;
    or_temp <== a * b;
    not_result <== 1 - c;
    
    final_temp1 <== and_result * not_result;
    final_temp2 <== or_temp * (1 - not_result);
    result <== final_temp1 + final_temp2;
}

component main = BooleanExample();