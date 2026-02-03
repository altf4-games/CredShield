const crypto = require('crypto');

class GPACircuit {
  constructor() {
    this.circuitName = 'gpa_verifier';
  }

  scaleGPA(gpa) {
    return Math.floor(gpa * 100);
  }

  unscaleGPA(scaledGpa) {
    return scaledGpa / 100;
  }

  generateProofInputs(gpa, threshold) {
    const scaledGPA = this.scaleGPA(gpa);
    const scaledThreshold = this.scaleGPA(threshold);

    const inputs = {
      gpa: scaledGPA,
      threshold: scaledThreshold,
      meetsThreshold: scaledGPA >= scaledThreshold ? 1 : 0
    };

    return inputs;
  }

  generateWitness(gpa, threshold) {
    const inputs = this.generateProofInputs(gpa, threshold);
    
    const witness = {
      privateInputs: {
        gpa: inputs.gpa
      },
      publicInputs: {
        threshold: inputs.threshold,
        meetsThreshold: inputs.meetsThreshold
      }
    };

    return witness;
  }

  async generateSimplifiedProof(gpa, threshold) {
    const witness = this.generateWitness(gpa, threshold);
    
    if (!witness.publicInputs.meetsThreshold) {
      throw new Error('GPA does not meet threshold requirement');
    }

    const proofData = {
      pi_a: this.generateRandomPoint(),
      pi_b: [this.generateRandomPoint(), this.generateRandomPoint()],
      pi_c: this.generateRandomPoint(),
      protocol: 'groth16',
      curve: 'bn128'
    };

    const publicSignals = [
      witness.publicInputs.threshold.toString(),
      witness.publicInputs.meetsThreshold.toString()
    ];

    const proofHash = crypto
      .createHash('sha256')
      .update(JSON.stringify({ proofData, publicSignals, timestamp: Date.now() }))
      .digest('hex');

    return {
      proof: proofData,
      publicSignals: publicSignals,
      proofHash: proofHash
    };
  }

  generateRandomPoint() {
    const x = crypto.randomBytes(32).toString('hex');
    const y = crypto.randomBytes(32).toString('hex');
    return [`0x${x}`, `0x${y}`];
  }

  formatProofForContract(proof) {
    return {
      a: proof.pi_a,
      b: proof.pi_b,
      c: proof.pi_c
    };
  }

  verifyProof(proof, publicSignals) {
    if (!proof || !publicSignals) {
      return false;
    }

    if (!proof.pi_a || !proof.pi_b || !proof.pi_c) {
      return false;
    }

    if (!Array.isArray(publicSignals) || publicSignals.length !== 2) {
      return false;
    }

    const meetsThreshold = parseInt(publicSignals[1]);
    return meetsThreshold === 1;
  }
}

module.exports = new GPACircuit();
