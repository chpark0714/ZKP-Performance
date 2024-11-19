import matplotlib.pyplot as plt
import numpy as np
import os

def create_comparison_graphs():
    # 결과물을 저장할 디렉토리 생성
    output_dir = 'results/graphs'
    os.makedirs(output_dir, exist_ok=True)
    
    # 데이터 준비
    # ZK-SNARK 데이터
    zk_circuits = ['Simple Add', 'Arithmetic', 'Sequential', 'Polynomial']
    zk_prove_times = [58.87, 60.81, 61.91, 69.58]  # 각 서킷의 평균 Proving 시간
    zk_verify_times = [14.92, 15.45, 17.09, 17.97]  # 각 서킷의 평균 Verification 시간
    
    # RSA와 ECC 데이터
    traditional_algos = ['RSA-3072', 'ECC P-256']
    key_gen_times = [569.37, 0.23]
    sign_times = [2.93, 1.55]
    verify_times = [0.24, 5.29]
    key_sizes = [3.04, 0.19]  # KB

    # 1. ZK-SNARK vs Traditional - Operation Times
    plt.figure(figsize=(12, 6))
    
    # ZK-SNARK 바 그래프
    x = np.arange(len(zk_circuits))
    width = 0.35
    plt.bar(x, zk_prove_times, width, label='Proving Time')
    plt.bar(x, zk_verify_times, width, bottom=zk_prove_times, label='Verification Time')
    
    plt.title('ZK-SNARK Performance by Circuit Type')
    plt.xlabel('Circuit Type')
    plt.ylabel('Time (ms)')
    plt.xticks(x, zk_circuits, rotation=45)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'zk_performance.png'))
    plt.close()

    # 2. RSA vs ECC Performance
    plt.figure(figsize=(10, 6))
    x = np.arange(len(traditional_algos))
    width = 0.25

    plt.bar(x - width, sign_times, width, label='Signing Time')
    plt.bar(x, verify_times, width, label='Verification Time')
    plt.bar(x + width, key_gen_times, width, label='Key Generation Time')

    plt.title('RSA vs ECC Performance Comparison')
    plt.xlabel('Algorithm')
    plt.ylabel('Time (ms)')
    plt.xticks(x, traditional_algos)
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'traditional_crypto_performance.png'))
    plt.close()

    # 3. Key Sizes Comparison
    plt.figure(figsize=(8, 6))
    plt.bar(traditional_algos, key_sizes)
    plt.title('Key Size Comparison')
    plt.xlabel('Algorithm')
    plt.ylabel('Size (KB)')
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'key_size_comparison.png'))
    plt.close()

    # 4. Overall Performance Comparison (Sign + Verify only)
    plt.figure(figsize=(12, 6))
    
    # Traditional crypto total times
    trad_total_times = [sign_times[0] + verify_times[0], sign_times[1] + verify_times[1]]
    
    # ZK total times
    zk_total_times = [p + v for p, v in zip(zk_prove_times, zk_verify_times)]
    
    all_names = traditional_algos + zk_circuits
    all_times = trad_total_times + zk_total_times
    
    plt.bar(all_names, all_times)
    plt.title('Total Operation Time Comparison\n(Sign+Verify for RSA/ECC, Prove+Verify for ZK-SNARK)')
    plt.xlabel('Algorithm/Circuit')
    plt.ylabel('Time (ms)')
    plt.xticks(rotation=45)
    plt.grid(True, alpha=0.3)
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'total_time_comparison.png'))
    plt.close()

    # 5. Operation Time Comparison (Without Key Generation)
    plt.figure(figsize=(15, 8))
    
    # 데이터 준비
    labels = ['RSA-3072', 'ECC P-256', 'ZK-Simple', 'ZK-Arithmetic', 'ZK-Sequential', 'ZK-Polynomial']
    
    # 각 알고리즘의 실행 시간
    operation_times = [
        [sign_times[0], verify_times[0]],  # RSA
        [sign_times[1], verify_times[1]],  # ECC
        [zk_prove_times[0], zk_verify_times[0]],  # ZK Simple
        [zk_prove_times[1], zk_verify_times[1]],  # ZK Arithmetic
        [zk_prove_times[2], zk_verify_times[2]],  # ZK Sequential
        [zk_prove_times[3], zk_verify_times[3]]   # ZK Polynomial
    ]
    
    # 그래프 생성
    x = np.arange(len(labels))
    width = 0.35
    
    # 단일 그래프로 모든 알고리즘 비교 (선형 스케일)
    plt.figure(figsize=(15, 8))
    
    prove_sign_times = [times[0] for times in operation_times]
    verify_times = [times[1] for times in operation_times]
    
    plt.bar(x - width/2, prove_sign_times, width, label='Prove/Sign Time')
    plt.bar(x + width/2, verify_times, width, label='Verify Time')
    
    plt.ylabel('Time (ms)')
    plt.title('Operation Time Comparison (Without Key Generation)')
    plt.xticks(x, labels, rotation=45)
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    # 그래프 위에 정확한 값 표시
    for i in range(len(x)):
        plt.text(x[i] - width/2, prove_sign_times[i], f'{prove_sign_times[i]:.2f}', 
                ha='center', va='bottom')
        plt.text(x[i] + width/2, verify_times[i], f'{verify_times[i]:.2f}', 
                ha='center', va='bottom')
    
    plt.tight_layout()
    plt.savefig(os.path.join(output_dir, 'operation_time_comparison.png'))
    plt.close()

    print(f"\nGraphs have been saved in: {os.path.abspath(output_dir)}")

if __name__ == "__main__":
    create_comparison_graphs() 