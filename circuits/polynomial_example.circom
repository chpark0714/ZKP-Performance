pragma circom 2.0.0;

template PolynomialExample() {
    // 입력
    signal input x;
    
    // 출력
    signal output y;
    
    // 중간 계산값
    signal x2;
    signal x3;
    signal x4;
    
    // x^4 + 2x^3 - 3x^2 + 4x - 5 계산
    x2 <== x * x;
    x3 <== x2 * x;
    x4 <== x3 * x;
    
    y <== x4 + 2*x3 - 3*x2 + 4*x - 5;
}

component main = PolynomialExample(); 