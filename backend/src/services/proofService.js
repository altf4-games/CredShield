const { ethers } = require('ethers');
const gpaCircuit = require('../circuits/gpaCircuit');
const documentProcessor = require('./documentProcessor');

class ProofService {
  constructor() {
    this.initialized = false;
    this.provider = null;
    this.contract = null;
    this.signer = null;
  }

  async initialize() {
    try {
      const rpcUrl = process.env.RPC_URL || 'http://localhost:8545';
      const contractAddress = process.env.CONTRACT_ADDRESS;
      const privateKey = process.env.PRIVATE_KEY;

      if (!contractAddress) {
        throw new Error('CONTRACT_ADDRESS not configured');
      }

      this.provider = new ethers.JsonRpcProvider(rpcUrl);

      if (privateKey) {
        this.signer = new ethers.Wallet(privateKey, this.provider);
      } else {
        this.signer = await this.provider.getSigner();
      }

      const contractABI = [
        'function verifyProof(uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[1] memory input) public returns (bool)',
        'function getVerification(bytes32 requestId) public view returns (address student, uint256 timestamp, bool verified)',
        'event ProofVerified(bytes32 indexed requestId, address indexed student, uint256 timestamp)',
        'event ProofRejected(bytes32 indexed requestId, address indexed student, uint256 timestamp)'
      ];

      this.contract = new ethers.Contract(contractAddress, contractABI, this.signer);

      this.initialized = true;
      console.log('ProofService initialized successfully');
      console.log(`Connected to contract at ${contractAddress}`);
    } catch (error) {
      console.error('Failed to initialize ProofService:', error.message);
      throw error;
    }
  }

  async generateProof(gpa, threshold) {
    if (!this.initialized) {
      await this.initialize();
    }

    const gpaValidation = documentProcessor.validateGPAValue(gpa);
    if (!gpaValidation.valid) {
      throw new Error(gpaValidation.reason);
    }

    const thresholdValidation = documentProcessor.validateThreshold(threshold);
    if (!thresholdValidation.valid) {
      throw new Error(thresholdValidation.reason);
    }

    if (gpa < threshold) {
      throw new Error('GPA does not meet the required threshold');
    }

    try {
      const proofResult = await gpaCircuit.generateSimplifiedProof(gpa, threshold);

      return {
        proof: proofResult.proof,
        publicSignals: proofResult.publicSignals,
        proofHash: proofResult.proofHash,
        metadata: {
          threshold: threshold,
          generated: new Date().toISOString(),
          meetsRequirement: true
        }
      };
    } catch (error) {
      throw new Error(`Proof generation failed: ${error.message}`);
    }
  }

  async verifyProofLocally(proof, publicSignals) {
    return gpaCircuit.verifyProof(proof, publicSignals);
  }

  async verifyProofOnChain(proof, publicSignals) {
    if (!this.initialized) {
      await this.initialize();
    }

    const isValidLocally = this.verifyProofLocally(proof, publicSignals);
    if (!isValidLocally) {
      throw new Error('Proof failed local validation');
    }

    try {
      const formattedProof = gpaCircuit.formatProofForContract(proof);

      const a = formattedProof.a;
      const b = formattedProof.b;
      const c = formattedProof.c;
      const input = [publicSignals[0]];

      const tx = await this.contract.verifyProof(a, b, c, input);
      const receipt = await tx.wait();

      return {
        verified: true,
        txHash: receipt.hash,
        blockNumber: receipt.blockNumber,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      throw new Error(`On-chain verification failed: ${error.message}`);
    }
  }

  async verifyProof(proof, publicSignals) {
    const localVerification = await this.verifyProofLocally(proof, publicSignals);
    
    if (!localVerification) {
      return {
        verified: false,
        localVerification: false,
        blockchainVerification: false,
        message: 'Proof verification failed locally'
      };
    }

    const onChainResult = await this.verifyProofOnChain(proof, publicSignals);
    
    return {
      verified: onChainResult.verified,
      localVerification: true,
      blockchainVerification: onChainResult.verified,
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber,
      timestamp: onChainResult.timestamp
    };
  }

  async checkEligibility(gpa, threshold) {
    const gpaValidation = documentProcessor.validateGPAValue(gpa);
    if (!gpaValidation.valid) {
      throw new Error(gpaValidation.reason);
    }

    const thresholdValidation = documentProcessor.validateThreshold(threshold);
    if (!thresholdValidation.valid) {
      throw new Error(thresholdValidation.reason);
    }

    const eligible = gpa >= threshold;

    return {
      eligible: eligible,
      gpa: gpa,
      threshold: threshold,
      message: eligible 
        ? 'GPA meets the requirement' 
        : 'GPA does not meet the requirement'
    };
  }
}

module.exports = new ProofService();
