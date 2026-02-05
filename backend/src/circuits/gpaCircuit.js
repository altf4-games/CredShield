const { groth16 } = require('snarkjs');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

class GPACircuit {
  constructor() {
    this.wasmPath = path.join(__dirname, '../../circuits/gpa_verifier_js/gpa_verifier.wasm');
    this.zkeyPath = path.join(__dirname, '../../circuits/gpa_verifier_final.zkey');
    this.vkeyPath = path.join(__dirname, '../../circuits/verification_key.json');
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;

    // Verify all circuit files exist
    if (!fs.existsSync(this.wasmPath)) {
      throw new Error(`WASM file not found at ${this.wasmPath}`);
    }
    if (!fs.existsSync(this.zkeyPath)) {
      throw new Error(`ZKey file not found at ${this.zkeyPath}`);
    }
    if (!fs.existsSync(this.vkeyPath)) {
      throw new Error(`Verification key not found at ${this.vkeyPath}`);
    }

    this.vkey = JSON.parse(fs.readFileSync(this.vkeyPath, 'utf8'));
    this.initialized = true;

    console.log(`   WASM: ${this.wasmPath}`);
    console.log(`   ZKey: ${this.zkeyPath}`);
  }

  async generateSimplifiedProof(gpa, threshold) {
    await this.initialize();

    // Scale GPA and threshold by 100 (7.5 -> 750)
    const scaledGPA = Math.floor(gpa * 100);
    const scaledThreshold = Math.floor(threshold * 100);

    // Validate inputs
    if (scaledGPA < 0 || scaledGPA > 1000) {
      throw new Error(`Invalid GPA: ${gpa}. Must be between 0 and 10.`);
    }
    if (scaledThreshold < 0 || scaledThreshold > 1000) {
      throw new Error(`Invalid threshold: ${threshold}. Must be between 0 and 10.`);
    }

    try {
      // Prepare circuit inputs
      const input = {
        gpa: scaledGPA.toString(),
        threshold: scaledThreshold.toString()
      };

      console.log('Generating ZK proof...');
      console.log(`Input GPA (private): ${gpa} (scaled: ${scaledGPA})`);
      console.log(`Threshold (public): ${threshold} (scaled: ${scaledThreshold})`);

      // Generate witness and proof using real Circom circuit
      const { proof, publicSignals } = await groth16.fullProve(
        input,
        this.wasmPath,
        this.zkeyPath
      );

      console.log('ZK proof generated!');
      console.log(`Public signals: [${publicSignals.join(', ')}]`);

      // Generate proof hash for tracking
      const proofString = JSON.stringify({
        a: proof.pi_a,
        b: proof.pi_b,
        c: proof.pi_c
      });
      const proofHash = crypto.createHash('sha256')
        .update(proofString)
        .digest('hex');

      return {
        proof: {
          pi_a: proof.pi_a.slice(0, 2),  // Remove third coordinate
          pi_b: [
            proof.pi_b[0].slice(0, 2),
            proof.pi_b[1].slice(0, 2)
          ],
          pi_c: proof.pi_c.slice(0, 2),
          protocol: 'groth16',
          curve: 'bn128'
        },
        publicSignals: publicSignals.map(s => s.toString()),
        proofHash: proofHash
      };
    } catch (error) {
      console.error('Proof generation failed:', error.message);
      throw new Error(`Circom proof generation failed: ${error.message}`);
    }
  }

  async verifyProof(proof, publicSignals) {
    await this.initialize();

    try {
      // Reconstruct full proof format for verification
      const fullProof = {
        pi_a: [...proof.pi_a, '1'],
        pi_b: [
          [...proof.pi_b[0], '1'],
          [...proof.pi_b[1], '1']
        ],
        pi_c: [...proof.pi_c, '1'],
        protocol: proof.protocol,
        curve: proof.curve
      };

      console.log('Verifying real ZK proof locally...');
      
      const verified = await groth16.verify(
        this.vkey,
        publicSignals,
        fullProof
      );

      console.log(`Local verification: ${verified ? '✅ PASSED' : '❌ FAILED'}`);

      return verified;
    } catch (error) {
      console.error('Verification failed:', error.message);
      return false;
    }
  }

  formatProofForContract(proof) {
    // Format proof for Solidity verifier
    return {
      a: proof.pi_a.slice(0, 2),
      b: [
        proof.pi_b[0].slice(0, 2).reverse(),  // Reverse for Solidity
        proof.pi_b[1].slice(0, 2).reverse()
      ],
      c: proof.pi_c.slice(0, 2)
    };
  }
}

module.exports = new GPACircuit();
