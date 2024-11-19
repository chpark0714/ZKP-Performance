pragma circom 2.0.0;

template SequentialExample(n) {
    // n개의 입력을 순차적으로 처리
    signal input in[n];
    signal output out[n];
    
    // 상태를 저장할 signal 배열
    signal state[n+1];
    state[0] <== 0;
    
    // 순차적 처리
    for (var i = 0; i < n; i++) {
        // 현재 상태와 입력을 기반으로 새로운 상태 계산
        state[i+1] <== state[i] + in[i];
        // 출력 계산
        out[i] <== state[i+1] * 2;
    }
}

component main = SequentialExample(4); 