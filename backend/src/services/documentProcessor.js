const geminiService = require('./geminiService');

class DocumentProcessor {
  constructor() {
    this.maxGPA_4Scale = 4.0;
    this.maxGPA_10Scale = 10.0;
  }

  async processDocument(documentText) {
    if (!documentText || typeof documentText !== 'string') {
      throw new Error('Invalid document text provided');
    }

    const validation = await geminiService.validateDocument(documentText);
    
    if (!validation.valid) {
      throw new Error(`Document validation failed: ${validation.reason}`);
    }

    const gpa = await geminiService.extractGPA(documentText);

    const processedData = this.prepareForZKP(gpa);

    return processedData;
  }

  prepareForZKP(gpa) {
    const normalizedGPA = this.normalizeGPA(gpa);

    return {
      gpa: normalizedGPA,
      scale: this.detectScale(gpa),
      zkpReady: true
    };
  }

  normalizeGPA(gpa) {
    if (gpa <= this.maxGPA_4Scale) {
      return (gpa / this.maxGPA_4Scale) * this.maxGPA_10Scale;
    }
    return gpa;
  }

  detectScale(gpa) {
    return gpa <= this.maxGPA_4Scale ? 4.0 : 10.0;
  }

  validateGPAValue(gpa) {
    if (typeof gpa !== 'number' || isNaN(gpa)) {
      return { valid: false, reason: 'GPA must be a number' };
    }

    if (gpa < 0) {
      return { valid: false, reason: 'GPA cannot be negative' };
    }

    if (gpa > this.maxGPA_10Scale) {
      return { valid: false, reason: 'GPA exceeds maximum value (10.0)' };
    }

    return { valid: true };
  }

  validateThreshold(threshold) {
    if (typeof threshold !== 'number' || isNaN(threshold)) {
      return { valid: false, reason: 'Threshold must be a number' };
    }

    if (threshold < 0 || threshold > this.maxGPA_10Scale) {
      return { valid: false, reason: 'Threshold must be between 0 and 10' };
    }

    return { valid: true };
  }
}

module.exports = new DocumentProcessor();
