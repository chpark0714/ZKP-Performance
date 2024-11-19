const snarkjs = require('snarkjs');
const { performance } = require('perf_hooks');
const fs = require('fs');

/* 
async function poseidonHash(inputs) {
    try {
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            { in: inputs },
            "build/poseidon_hash_js/poseidon_hash.wasm",
            "build/poseidon_hash_final.zkey"
        );
        return BigInt(publicSignals[0]);
    } catch (error) {
        console.error("Error in poseidonHash:", error);
        throw error;
    }
}

async function generateMerkleRoot(leaf, pathElements) {
    let currentHash = BigInt(leaf);
    for (let i = 0; i < pathElements.length; i++) {
        currentHash = await poseidonHash([currentHash, BigInt(pathElements[i])]);
    }
    return currentHash;
}
*/

async function testCircuit(circuitName, input, description = "") {
    try {
        console.log(`Testing ${circuitName} - ${description} with input:`, input);
        
        // Proving 시간 측정
        const proveStartTime = Date.now();
        console.log(`Prove start time: ${proveStartTime}`);  // 디버깅 로그
        
        const { proof, publicSignals } = await snarkjs.groth16.fullProve(
            input,
            `build/${circuitName}_js/${circuitName}.wasm`,
            `build/${circuitName}_final.zkey`
        );
        
        const proveEndTime = Date.now();
        console.log(`Prove end time: ${proveEndTime}`);  // 디버깅 로그
        const proveTime = proveEndTime - proveStartTime;
        console.log(`Prove time: ${proveTime}`);  // 디버깅 로그
        
        // Verification 시간 측정
        const verifyStartTime = Date.now();
        console.log(`Verify start time: ${verifyStartTime}`);  // 디버깅 로그
        
        const vKey = JSON.parse(fs.readFileSync(`build/${circuitName}_verification_key.json`).toString());
        const isValid = await snarkjs.groth16.verify(vKey, publicSignals, proof);
        
        const verifyEndTime = Date.now();
        console.log(`Verify end time: ${verifyEndTime}`);  // 디버깅 로그
        const verifyTime = verifyEndTime - verifyStartTime;
        console.log(`Verify time: ${verifyTime}`);  // 디버깅 로그
        
        // 배열에 추가하기 전에 값 확인
        console.log(`Return values:`, {
            isValid,
            proveTime,
            verifyTime,
            totalTime: proveTime + verifyTime,
            proofSize: JSON.stringify(proof).length,
        });

        return {
            isValid,
            proveTime,
            verifyTime,
            totalTime: proveTime + verifyTime,
            proofSize: JSON.stringify(proof).length,
            publicSignals
        };
    } catch (error) {
        console.error(`Error testing circuit ${circuitName}:`, error);
        return null;
    }
}

async function runAllTests(iterations = 100) {
    console.log(`Starting ${iterations} iterations of all tests...\n`);
    
    // 다양한 입력값 세트 정의
    const testInputs = {
        simple_add: [
            { input: { a: 1, b: 1 }, desc: "Small Numbers" },
            { input: { a: 999999, b: 999999 }, desc: "Large Numbers" },
            { input: { a: -500, b: 500 }, desc: "Mixed Numbers" }
        ],
        arithmetic_example: [
            { input: { a: 1, b: 1, c: 1 }, desc: "Small Numbers" },
            { input: { a: 999999, b: 999999, c: 999999 }, desc: "Large Numbers" },
            { input: { a: 123456, b: 789012, c: 345678 }, desc: "Mixed Large Numbers" }
        ],
        sequential_example: [
            { input: { in: [1, 1, 1, 1] }, desc: "Small Array" },
            { input: { in: [9999, 9999, 9999, 9999] }, desc: "Large Array" },
            { input: { in: [1234, 5678, 9012, 3456] }, desc: "Mixed Array" }
        ],
        polynomial_example: [
            { input: { x: 1 }, desc: "Small Input" },
            { input: { x: 999999 }, desc: "Large Input" },
            { input: { x: -5000 }, desc: "Negative Input" }
        ]
    };

    const stats = {};
    
    // 각 서킷에 대해
    for (const [circuitName, inputSets] of Object.entries(testInputs)) {
        stats[circuitName] = {};
        
        // 각 입력값 세트에 대해
        for (const { input, desc } of inputSets) {
            stats[circuitName][desc] = {
                proveTimes: [],
                verifyTimes: [],
                sizes: []
            };
            
            // 반복 테스트
            for (let i = 0; i < iterations; i++) {
                console.log(`\nIteration ${i + 1}/${iterations}`);
                const result = await testCircuit(circuitName, input, desc);
                if (result) {
                    console.log(`Adding times to stats:`, {  // 디버깅 로그
                        proveTime: result.proveTime,
                        verifyTime: result.verifyTime,
                        size: result.proofSize
                    });
                    
                    stats[circuitName][desc].proveTimes.push(result.proveTime);
                    stats[circuitName][desc].verifyTimes.push(result.verifyTime);
                    stats[circuitName][desc].sizes.push(result.proofSize);
                    
                    // 배열 상태 확인
                    console.log(`Current stats for ${circuitName} - ${desc}:`, {
                        proveTimes: stats[circuitName][desc].proveTimes.length,
                        verifyTimes: stats[circuitName][desc].verifyTimes.length,
                        sizes: stats[circuitName][desc].sizes.length
                    });
                }
            }
        }
    }
    
    // 결과 계산 전에 stats 객체 상태 확인
    console.log('\nFinal stats object before calculation:', JSON.stringify(stats, null, 2));
    
    // 결과 출력
    console.log('\n=== Test Results ===');
    for (const [circuit, inputResults] of Object.entries(stats)) {
        console.log(`\n${circuit.toUpperCase()}:`);
        
        for (const [desc, data] of Object.entries(inputResults)) {
            if (data.proveTimes.length === 0 || data.verifyTimes.length === 0) {
                console.log(`\n  ${desc}: No valid measurements`);
                continue;
            }
            
            const avgProveTime = data.proveTimes.reduce((a, b) => a + b, 0) / data.proveTimes.length;
            const avgVerifyTime = data.verifyTimes.reduce((a, b) => a + b, 0) / data.verifyTimes.length;
            const avgSize = data.sizes.reduce((a, b) => a + b, 0) / data.sizes.length;
            
            console.log(`\n  ${desc}:`);
            console.log(`  Average Proving Time: ${avgProveTime.toFixed(3)} ms`);
            console.log(`  Average Verification Time: ${avgVerifyTime.toFixed(3)} ms`);
            console.log(`  Average Total Time: ${(avgProveTime + avgVerifyTime).toFixed(3)} ms`);
            console.log(`  Average Proof Size: ${avgSize.toFixed(2)} bytes`);
            console.log(`  Number of Successful Tests: ${data.proveTimes.length}`);
            
            console.log(`  Raw Prove Times:`, data.proveTimes.slice(0, 5), '...');
            console.log(`  Raw Verify Times:`, data.verifyTimes.slice(0, 5), '...');
        }
    }
}

// Program Execution
runAllTests().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});

// Unhandled Promise Rejection Handler
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});