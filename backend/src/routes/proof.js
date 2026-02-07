const { Router } = require('express');
const proofService = require('../services/proofService');
const geminiService = require('../services/geminiService');
const documentProcessor = require('../services/documentProcessor');
const { 
  validateProofGeneration, 
  validateProofVerification,
  validateEligibilityCheck 
} = require('../middleware/validation');

const router = Router();

router.post('/generate', validateProofGeneration, async (req, res, next) => {
  try {
    const { gpa, documentText, threshold } = req.body;
    
    let actualGPA = gpa;

    if (documentText && !gpa) {
      const processedData = await documentProcessor.processDocument(documentText);
      actualGPA = processedData.gpa;
    }

    const proofResult = await proofService.generateProof(actualGPA, threshold);

    const verificationCode = proofStorage.storeProof(
      proofResult.proof,
      proofResult.publicSignals,
      {
        ...proofResult.metadata,
        extractedGPA: actualGPA
      }
    );

    res.json({
      success: true,
      proof: proofResult.proof,
      publicSignals: proofResult.publicSignals,
      proofHash: proofResult.proofHash,
      metadata: proofResult.metadata,
      verificationCode: verificationCode,
      verificationUrl: `/api/proof/verify-code/${verificationCode}`,
      message: `Proof generated successfully. Share code: ${verificationCode}`
    });
  } catch (error) {
    next(error);
  }
});

router.post('/verify', validateProofVerification, async (req, res, next) => {
  try {
    const { proof, publicSignals } = req.body;

    const localVerification = await proofService.verifyProofLocally(proof, publicSignals);

    if (!localVerification) {
      return res.status(400).json({
        success: false,
        verified: false,
        message: 'Proof verification failed locally'
      });
    }

    const onChainResult = await proofService.verifyProofOnChain(proof, publicSignals);

    res.json({
      success: true,
      verified: onChainResult.verified,
      txHash: onChainResult.txHash,
      blockNumber: onChainResult.blockNumber,
      timestamp: onChainResult.timestamp,
      message: 'Proof verified successfully on blockchain'
    });
  } catch (error) {
    next(error);
  }
});

router.post('/check-eligibility', validateEligibilityCheck, async (req, res, next) => {
  try {
    const { gpa, documentText, threshold } = req.body;

    let actualGPA = gpa;

    if (documentText && !gpa) {
      const processedData = await documentProcessor.processDocument(documentText);
      actualGPA = processedData.gpa;
    }

    const eligibilityResult = await proofService.checkEligibility(actualGPA, threshold);

    if (eligibilityResult.eligible) {
      const proofResult = await proofService.generateProof(actualGPA, threshold);
      
      res.json({
        success: true,
        eligible: true,
        message: eligibilityResult.message,
        proof: proofResult.proof,
        publicSignals: proofResult.publicSignals,
        proofHash: proofResult.proofHash
      });
    } else {
      res.json({
        success: true,
        eligible: false,
        message: eligibilityResult.message
      });
    }
  } catch (error) {
    next(error);
  }
});

router.post('/generate-from-document', async (req, res, next) => {
  const upload = require('../middleware/upload');
  const geminiService = require('../services/geminiService');

  upload.single('document')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        error: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded'
      });
    }

    if (!req.body.threshold) {
      return res.status(400).json({
        success: false,
        error: 'Threshold is required'
      });
    }

    const threshold = parseFloat(req.body.threshold);

    if (isNaN(threshold) || threshold < 0 || threshold > 10) {
      return res.status(400).json({
        success: false,
        error: 'Threshold must be a number between 0 and 10'
      });
    }

    try {
      const fileBuffer = req.file.buffer;
      const mimeType = req.file.mimetype;
      
      const studentInfo = await geminiService.extractStudentInfo(fileBuffer, mimeType);
      const actualGPA = studentInfo.gpa;
      const studentName = studentInfo.name;

      // Generate proof off-chain
      const proofResult = await proofService.generateProof(actualGPA, threshold);

      // Generate verification code
      const verificationCode = Math.random().toString(36).substring(2, 10).toUpperCase();

      // Submit proof to blockchain immediately
      const blockchainResult = await proofService.verifyProof(
        proofResult.proof,
        proofResult.publicSignals,
        verificationCode,
        studentName
      );

      res.json({
        success: true,
        studentName: studentName,
        extractedGPA: actualGPA,
        fileType: mimeType,
        verificationCode: verificationCode,
        txHash: blockchainResult.txHash,
        blockNumber: blockchainResult.blockNumber,
        metadata: {
          ...proofResult.metadata,
          studentName: studentName,
          onChain: true
        },
        message: `Proof verified on blockchain. Transaction: ${blockchainResult.txHash}`
      });
    } catch (error) {
      next(error);
    }
  });
});

router.post('/verify-code', async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        error: 'Verification code is required'
      });
    }

    // Query blockchain for verification record
    const verificationRecord = await proofService.getVerificationFromBlockchain(code);

    if (!verificationRecord.exists) {
      return res.status(404).json({
        success: false,
        error: 'Verification code not found on blockchain'
      });
    }

    res.json({
      success: true,
      verified: verificationRecord.verified,
      code: code,
      metadata: {
        submitter: verificationRecord.submitter,
        studentName: verificationRecord.studentName,
        threshold: verificationRecord.threshold / 100,
        verified: verificationRecord.verified,
        timestamp: verificationRecord.timestamp
      },
      message: verificationRecord.verified 
        ? 'Proof verified successfully on blockchain' 
        : 'Proof verification failed'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/verify-code/:code', async (req, res, next) => {
  try {
    const code = req.params.code;
    
    // Query blockchain for verification record
    const verificationRecord = await proofService.getVerificationFromBlockchain(code);

    if (!verificationRecord.exists) {
      return res.status(404).json({
        success: false,
        error: 'Verification code not found on blockchain'
      });
    }

    res.json({
      success: true,
      verified: verificationRecord.verified,
      code: code,
      metadata: {
        studentAddress: verificationRecord.student,
        threshold: verificationRecord.threshold / 100, // Scale back down
        verified: verificationRecord.verified,
        timestamp: verificationRecord.timestamp
      },
      message: verificationRecord.verified 
        ? 'Proof verified successfully on blockchain' 
        : 'Proof verification failed'
    });
  } catch (error) {
    next(error);
  }
});

router.get('/status', async (req, res) => {
  const storageStats = proofStorage.getStats();
  
  res.json({
    status: 'operational',
    endpoints: {
      generate: '/api/proof/generate',
      verify: '/api/proof/verify',
      checkEligibility: '/api/proof/check-eligibility',
      generateFromDocument: '/api/proof/generate-from-document',
      verifyWithCode: '/api/proof/verify-code (POST with code)',
      verifyCodeDirect: '/api/proof/verify-code/:code (GET)'
    },
    storage: storageStats,
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
