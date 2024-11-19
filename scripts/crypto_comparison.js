const crypto = require('crypto');
const EC = require('elliptic').ec;

async function runCryptoTests(iterations = 100) {
    console.log(`Starting ${iterations} iterations of RSA-3072 and ECC P-256 tests...\n`);

    const stats = {
        rsa: {
            keyGenTimes: [],
            signTimes: [],
            verifyTimes: [],
            keySize: []
        },
        ecc: {
            keyGenTimes: [],
            signTimes: [],
            verifyTimes: [],
            keySize: []
        }
    };

    const testMessage = 'Hello, World!';
    const ec = new EC('p256');

    // RSA 키 한 번만 생성
    console.log('\nGenerating RSA-3072 key pair...');
    const rsaKeyGenStart = Date.now();
    const { privateKey: rsaPrivateKey, publicKey: rsaPublicKey } = crypto.generateKeyPairSync('rsa', {
        modulusLength: 3072,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
    });
    const rsaKeyGenTime = Date.now() - rsaKeyGenStart;
    stats.rsa.keyGenTimes.push(rsaKeyGenTime);
    stats.rsa.keySize.push(rsaPublicKey.length + rsaPrivateKey.length);

    // ECC 키 한 번만 생성
    console.log('Generating ECC P-256 key pair...');
    const eccKeyGenStart = Date.now();
    const eccKey = ec.genKeyPair();
    const eccKeyGenTime = Date.now() - eccKeyGenStart;
    stats.ecc.keyGenTimes.push(eccKeyGenTime);
    const pubKey = eccKey.getPublic('hex');
    const privKey = eccKey.getPrivate('hex');
    stats.ecc.keySize.push(pubKey.length + privKey.length);

    for (let i = 0; i < iterations; i++) {
        console.log(`\nIteration ${i + 1}/${iterations}`);

        // RSA-3072 Test
        try {
            // RSA Signing
            const rsaSignStart = Date.now();
            const signer = crypto.createSign('SHA256');
            signer.update(testMessage);
            const rsaSignature = signer.sign(rsaPrivateKey);
            const rsaSignTime = Date.now() - rsaSignStart;
            stats.rsa.signTimes.push(rsaSignTime);

            // RSA Verification
            const rsaVerifyStart = Date.now();
            const verifier = crypto.createVerify('SHA256');
            verifier.update(testMessage);
            verifier.verify(rsaPublicKey, rsaSignature);
            const rsaVerifyTime = Date.now() - rsaVerifyStart;
            stats.rsa.verifyTimes.push(rsaVerifyTime);
        } catch (error) {
            console.error('RSA Error:', error);
        }

        // ECC P-256 Test
        try {
            // ECC Signing
            const eccSignStart = Date.now();
            const msgHash = crypto.createHash('sha256').update(testMessage).digest();
            const eccSignature = eccKey.sign(msgHash);
            const eccSignTime = Date.now() - eccSignStart;
            stats.ecc.signTimes.push(eccSignTime);

            // ECC Verification
            const eccVerifyStart = Date.now();
            const isValid = eccKey.verify(msgHash, eccSignature);
            const eccVerifyTime = Date.now() - eccVerifyStart;
            stats.ecc.verifyTimes.push(eccVerifyTime);
        } catch (error) {
            console.error('ECC Error:', error);
        }

        // 진행 상황 출력
        if ((i + 1) % 10 === 0) {
            console.log(`Completed ${i + 1} iterations`);
        }
    }

    // 결과 출력
    console.log('\n=== Cryptography Performance Comparison ===');
    
    for (const [algo, data] of Object.entries(stats)) {
        const keyGenTime = data.keyGenTimes[0];  // 한 번만 생성했으므로 첫 번째 값만 사용
        const avgSign = data.signTimes.reduce((a, b) => a + b, 0) / iterations;
        const avgVerify = data.verifyTimes.reduce((a, b) => a + b, 0) / iterations;
        const avgOperationTime = avgSign + avgVerify;  // 실제 사용시 평균 시간
        const keySize = data.keySize[0];  // 한 번만 생성했으므로 첫 번째 값만 사용

        console.log(`\n${algo.toUpperCase()} ${algo === 'rsa' ? '(3072-bit)' : '(P-256)'}`);
        console.log(`Initial Key Generation Time: ${keyGenTime.toFixed(3)} ms`);
        console.log(`Average Signing Time: ${avgSign.toFixed(3)} ms`);
        console.log(`Average Verification Time: ${avgVerify.toFixed(3)} ms`);
        console.log(`Average Operation Time (Sign + Verify): ${avgOperationTime.toFixed(3)} ms`);
        console.log(`Key Size: ${(keySize / 1024).toFixed(2)} KB`);
        
        console.log('\nDetailed Statistics:');
        console.log(`Signing Time Range: ${Math.min(...data.signTimes)} - ${Math.max(...data.signTimes)} ms`);
        console.log(`Verification Time Range: ${Math.min(...data.verifyTimes)} - ${Math.max(...data.verifyTimes)} ms`);
    }
}

// 실행
runCryptoTests().catch(console.error); 