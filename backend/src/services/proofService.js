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
        'function verifyProof(bytes32 code, string memory studentName, uint[2] memory a, uint[2][2] memory b, uint[2] memory c, uint[2] memory pubSignals) public returns (bool)',
        'function getVerification(bytes32 code) public view returns (address submitter, string memory studentName, uint256 threshold, bool verified, uint256 timestamp)',
        'function isCodeUsed(bytes32 code) public view returns (bool)',
        'event ProofVerified(bytes32 indexed verificationCode, address indexed student, uint256 threshold, uint256 timestamp)',
        'event ProofRejected(bytes32 indexed verificationCode, address indexed student, uint256 timestamp)'
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

  async verifyProofOnChain(proof, publicSignals, verificationCode, studentName) {
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
      
      // Convert verification code to bytes32
      const codeBytes32 = ethers.id(verificationCode);
      
      // Pass both public signals: [result, threshold]
      const pubSignalsArray = [
        publicSignals[0], // result (1 or 0)
        publicSignals[1]  // threshold (scaled by 100)
      ];

      const tx = await this.contract.verifyProof(codeBytes32, studentName, a, b, c, pubSignalsArray);
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

  async verifyProof(proof, publicSignals, verificationCode, studentName) {
    const localVerification = await this.verifyProofLocally(proof, publicSignals);
    
    if (!localVerification) {
      return {
        verified: false,
        localVerification: false,
        blockchainVerification: false,
        message: 'Proof verification failed locally'
      };
    }

    const onChainResult = await this.verifyProofOnChain(proof, publicSignals, verificationCode, studentName);
    
    return {
      verified: true,
      localVerification: true,
      blockchainVerification: true,
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber,
      timestamp: onChainResult.timestamp,
      message: 'Proof verified successfully on blockchain'
    };
  }

  async getVerificationFromBlockchain(verificationCode) {
    if (!this.initialized) {
      await this.initialize();
    }

    try {
      // Convert verification code to bytes32
      const codeBytes32 = ethers.id(verificationCode);

      // Query contract for verification record
      const result = await this.contract.getVerification(codeBytes32);

      // result is [submitter, studentName, threshold, verified, timestamp]
      const submitter = result[0];
      const studentName = result[1];
      const threshold = result[2];
      const verified = result[3];
      const timestamp = result[4];

      // Check if record exists (timestamp will be 0 if not)
      const exists = timestamp.toString() !== '0';

      return {
        exists: exists,
        submitter: submitter,
        studentName: studentName,
        threshold: Number(threshold),
        verified: verified,
        timestamp: exists ? new Date(Number(timestamp) * 1000).toISOString() : null
      };
    } catch (error) {
      console.error('Blockchain query error:', error.message);
      return {
        exists: false,
        submitter: ethers.ZeroAddress,
        studentName: '',
        threshold: 0,
        verified: false,
        timestamp: null
      };
    }
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
