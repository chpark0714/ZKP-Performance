import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';

const execAsync = promisify(exec);

async function compileCircuit(circuitName: string) {
    try {
        // circom 컴파일
        console.log(`Compiling ${circuitName}...`);
        await execAsync(`circom circuits/${circuitName}.circom --r1cs --wasm --sym`);
        
        // 신뢰 설정 생성
        console.log('Generating trusted setup...');
        await execAsync(`snarkjs powersoftau new bn128 12 pot12_0000.ptau -v`);
        await execAsync(`snarkjs powersoftau contribute pot12_0000.ptau pot12_0001.ptau --name="First contribution" -v`);
        await execAsync(`snarkjs powersoftau prepare phase2 pot12_0001.ptau pot12_final.ptau -v`);
        
        // 회로별 설정 파일 생성
        await execAsync(`snarkjs groth16 setup ${circuitName}.r1cs pot12_final.ptau ${circuitName}_0000.zkey`);
        await execAsync(`snarkjs zkey contribute ${circuitName}_0000.zkey ${circuitName}_final.zkey --name="1st Contributor" -v`);
        
        // 검증 키 추출
        await execAsync(`snarkjs zkey export verificationkey ${circuitName}_final.zkey ${circuitName}_verification_key.json`);
        
        console.log(`Circuit ${circuitName} compiled successfully!`);
    } catch (error) {
        console.error(`Error compiling circuit ${circuitName}:`, error);
    }
}

// 모든 회로 컴파일
async function compileAll() {
    await compileCircuit('simple_add');
    await compileCircuit('hash_check');
    await compileCircuit('merkle_proof');
}

compileAll(); 