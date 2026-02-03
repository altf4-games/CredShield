const crypto = require('crypto');

class ProofStorage {
  constructor() {
    this.proofs = new Map();
    this.expiryTime = 24 * 60 * 60 * 1000; // 24 hours
  }

  generateCode() {
    return crypto.randomBytes(4).toString('hex').toUpperCase();
  }

  storeProof(proof, publicSignals, metadata) {
    const code = this.generateCode();
    const expiresAt = Date.now() + this.expiryTime;
    
    this.proofs.set(code, {
      proof,
      publicSignals,
      metadata,
      expiresAt,
      createdAt: new Date().toISOString()
    });

    this.cleanupExpired();
    
    return code;
  }

  getProof(code) {
    const data = this.proofs.get(code.toUpperCase());
    
    if (!data) {
      return null;
    }

    if (Date.now() > data.expiresAt) {
      this.proofs.delete(code.toUpperCase());
      return null;
    }

    return data;
  }

  cleanupExpired() {
    const now = Date.now();
    for (const [code, data] of this.proofs.entries()) {
      if (now > data.expiresAt) {
        this.proofs.delete(code);
      }
    }
  }

  getStats() {
    this.cleanupExpired();
    return {
      totalStored: this.proofs.size,
      expiryHours: this.expiryTime / (60 * 60 * 1000)
    };
  }
}

module.exports = new ProofStorage();
