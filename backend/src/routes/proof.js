const { Router } = require('express');
const proofService = require('../services/proofService');
const geminiService = require('../services/geminiService');
const documentProcessor = require('../services/documentProcessor');
const proofStorage = require('../services/proofStorage');
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

      const proofResult = await proofService.generateProof(actualGPA, threshold);

      const verificationCode = proofStorage.storeProof(
        proofResult.proof,
        proofResult.publicSignals,
        {
          ...proofResult.metadata,
          extractedGPA: actualGPA,
          studentName: studentName,
          fileType: mimeType
        }
      );

      res.json({
        success: true,
        studentName: studentName,
        extractedGPA: actualGPA,
        fileType: mimeType,
        proof: proofResult.proof,
        publicSignals: proofResult.publicSignals,
        proofHash: proofResult.proofHash,
        metadata: proofResult.metadata,
        verificationCode: verificationCode,
        verificationUrl: `/api/proof/verify-code/${verificationCode}`,
        message: `Proof generated for ${studentName}. Share code: ${verificationCode}`
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

    const storedData = proofStorage.getProof(code);

    if (!storedData) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    const verificationResult = await proofService.verifyProof(
      storedData.proof,
      storedData.publicSignals
    );

    res.json({
      success: true,
      verified: verificationResult.verified,
      code: code,
      metadata: storedData.metadata,
      txHash: verificationResult.txHash,
      blockNumber: verificationResult.blockNumber,
      timestamp: new Date().toISOString(),
      message: verificationResult.verified 
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
    const storedData = proofStorage.getProof(code);

    if (!storedData) {
      return res.status(404).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    const verificationResult = await proofService.verifyProof(
      storedData.proof,
      storedData.publicSignals
    );

    res.json({
      success: true,
      verified: verificationResult.verified,
      code: code,
      metadata: storedData.metadata,
      txHash: verificationResult.txHash,
      blockNumber: verificationResult.blockNumber,
      timestamp: new Date().toISOString(),
      message: verificationResult.verified 
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
