const { body, validationResult } = require('express-validator');

const validateProofGeneration = [
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('GPA must be between 0 and 10'),
  
  body('documentText')
    .optional()
    .isString()
    .isLength({ min: 10 })
    .withMessage('Document text must be at least 10 characters'),
  
  body('threshold')
    .notEmpty()
    .withMessage('Threshold is required')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Threshold must be between 0 and 10'),

  (req, res, next) => {
    if (!req.body.gpa && !req.body.documentText) {
      return res.status(400).json({
        error: 'Either gpa or documentText must be provided'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const validateProofVerification = [
  body('proof')
    .notEmpty()
    .withMessage('Proof is required')
    .isObject()
    .withMessage('Proof must be an object'),
  
  body('publicSignals')
    .notEmpty()
    .withMessage('Public signals are required')
    .isArray()
    .withMessage('Public signals must be an array'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

const validateEligibilityCheck = [
  body('gpa')
    .optional()
    .isFloat({ min: 0, max: 10 })
    .withMessage('GPA must be between 0 and 10'),
  
  body('documentText')
    .optional()
    .isString()
    .isLength({ min: 10 })
    .withMessage('Document text must be at least 10 characters'),
  
  body('threshold')
    .notEmpty()
    .withMessage('Threshold is required')
    .isFloat({ min: 0, max: 10 })
    .withMessage('Threshold must be between 0 and 10'),

  (req, res, next) => {
    if (!req.body.gpa && !req.body.documentText) {
      return res.status(400).json({
        error: 'Either gpa or documentText must be provided'
      });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    next();
  }
];

module.exports = {
  validateProofGeneration,
  validateProofVerification,
  validateEligibilityCheck
};
