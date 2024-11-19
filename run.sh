#!/bin/bash

# 빌드 디렉토리 생성
mkdir -p build

# 모든 서킷 컴파일
echo "Compiling circuits..."

# 기존 서킷들
circom circuits/simple_add.circom --r1cs --wasm --sym -o build
# circom circuits/hash_check.circom --r1cs --wasm --sym -o build
# circom circuits/merkle_proof.circom --r1cs --wasm --sym -o build
# circom circuits/poseidon_hash.circom --r1cs --wasm --sym -o build

# 새로 추가된 서킷들
circom circuits/arithmetic_example.circom --r1cs --wasm --sym -o build
circom circuits/boolean_example.circom --r1cs --wasm --sym -o build
circom circuits/sequential_example.circom --r1cs --wasm --sym -o build
circom circuits/sat_example.circom --r1cs --wasm --sym -o build
circom circuits/polynomial_example.circom --r1cs --wasm --sym -o build

# Powers of Tau 생성 (2^18 = 262,144로 설정)
echo "Generating Powers of Tau..."
snarkjs powersoftau new bn128 18 build/pot18_0000.ptau -v
snarkjs powersoftau contribute build/pot18_0000.ptau build/pot18_0001.ptau --name="First contribution" -v -e="random text"
snarkjs powersoftau prepare phase2 build/pot18_0001.ptau build/pot18_final.ptau -v

# 각 서킷별 설정 파일 생성
for circuit in simple_add arithmetic_example boolean_example sequential_example sat_example polynomial_example
do
    echo "Setting up $circuit..."
    snarkjs groth16 setup build/${circuit}.r1cs build/pot18_final.ptau build/${circuit}_0000.zkey
    snarkjs zkey contribute build/${circuit}_0000.zkey build/${circuit}_final.zkey --name="1st Contributor" -v -e="random text"
    snarkjs zkey export verificationkey build/${circuit}_final.zkey build/${circuit}_verification_key.json
done

# 테스트 실행
echo "Running tests..."
npm run test