const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs').promises;
const path = require('path');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
    this.referenceImages = null;
  }

  initialize() {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn('Gemini API key not configured. Document processing will use fallback.');
      return;
    }

    try {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
      this.initialized = true;
      console.log('Gemini API initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Gemini API:', error.message);
    }
  }

  async extractGPA(documentText) {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized. Please configure GEMINI_API_KEY.');
    }

    const prompt = `
You are analyzing an academic transcript or marksheet. Extract ONLY the GPA or CGPA value.

Document:
${documentText}

Instructions:
- Return ONLY a single number representing the GPA/CGPA
- If the GPA is on a 4.0 scale, return as-is (e.g., 3.75)
- If the GPA is on a 10.0 scale, return as-is (e.g., 8.5)
- If you find percentage, convert to 10.0 scale by dividing by 10
- Return ONLY the number, nothing else
- If no valid GPA found, return "ERROR"

GPA:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim();

      const gpaValue = parseFloat(text);
      
      if (isNaN(gpaValue)) {
        throw new Error('Could not extract valid GPA from document');
      }

      if (gpaValue < 0 || gpaValue > 10) {
        throw new Error('Extracted GPA out of valid range (0-10)');
      }

      return gpaValue;
    } catch (error) {
      throw new Error(`GPA extraction failed: ${error.message}`);
    }
  }

  async validateDocument(documentText) {
    if (!this.initialized) {
      return { valid: true, reason: 'Validation skipped - API not initialized' };
    }

    const prompt = `
You are validating an academic document. Determine if this appears to be a legitimate academic transcript/marksheet.

Document:
${documentText}

Check for:
- Academic institution name
- Student information structure
- Course/subject listings
- Grades or marks
- Official formatting elements

Return ONLY "VALID" or "INVALID".

Result:`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text().trim().toUpperCase();

      return {
        valid: text === 'VALID',
        reason: text === 'VALID' ? 'Document appears authentic' : 'Document validation failed'
      };
    } catch (error) {
      return { valid: false, reason: `Validation error: ${error.message}` };
    }
  }

  async extractGPAFromImage(imageBuffer, mimeType) {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
      const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const prompt = `
Analyze this academic document (transcript/marksheet/certificate) and extract ONLY the GPA or CGPA value.

This document may be:
- A PDF (text-based or scanned)
- An image (PNG/JPG) of an academic transcript
- A screenshot of grades

Instructions:
- Look for GPA, CGPA, or overall grade
- Return ONLY a single number representing the GPA/CGPA
- If the GPA is on a 4.0 scale, return as-is (e.g., 3.75)
- If the GPA is on a 10.0 scale, return as-is (e.g., 8.5)
- If you find percentage (e.g., 85%), convert to 10.0 scale by dividing by 10 (8.5)
- Return ONLY the number, nothing else
- If no valid GPA found, return "ERROR"

Look carefully at the entire document. Common locations for GPA:
- "CGPA:" or "GPA:" followed by a number
- "Overall Grade" section
- Summary section at the bottom
- Final results section

Extract the GPA value:`;

      const result = await visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      const gpaValue = parseFloat(text);
      
      if (isNaN(gpaValue)) {
        throw new Error(`Could not extract valid GPA from document. Gemini returned: "${text}"`);
      }

      if (gpaValue < 0 || gpaValue > 10) {
        throw new Error(`Extracted GPA (${gpaValue}) out of valid range (0-10)`);
      }

      return gpaValue;
    } catch (error) {
      throw new Error(`GPA extraction from document failed: ${error.message}`);
    }
  }

  async extractStudentInfo(imageBuffer, mimeType) {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized. Please configure GEMINI_API_KEY.');
    }

    try {
      const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const imagePart = {
        inlineData: {
          data: imageBuffer.toString('base64'),
          mimeType: mimeType
        }
      };

      const prompt = `
Analyze this academic document and extract the student information.

Return ONLY a JSON object with this exact format:
{
  "name": "Student Full Name",
  "gpa": 8.5
}

Instructions for GPA:
- If the GPA is on a 4.0 scale, return as-is (e.g., 3.75)
- If the GPA is on a 10.0 scale, return as-is (e.g., 8.5)
- If you find percentage (e.g., 85%), convert to 10.0 scale by dividing by 10 (8.5)

Instructions for Name:
- Extract the full student name (First + Last name)
- Look for fields like "Student Name:", "Name:", "Candidate:", etc.
- Return only the name, no titles (Dr., Mr., Ms.)

Return ONLY the JSON object, nothing else.`;

      const result = await visionModel.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text().trim();

      // Remove markdown code blocks if present
      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      const data = JSON.parse(jsonText);
      
      if (!data.name || !data.gpa) {
        throw new Error('Could not extract student name or GPA from document');
      }

      const gpaValue = parseFloat(data.gpa);
      
      if (isNaN(gpaValue) || gpaValue < 0 || gpaValue > 10) {
        throw new Error(`Invalid GPA value: ${data.gpa}`);
      }

      return {
        name: data.name.trim(),
        gpa: gpaValue
      };
    } catch (error) {
      throw new Error(`Student info extraction failed: ${error.message}`);
    }
  }

  async loadReferenceImages() {
    if (this.referenceImages) {
      return this.referenceImages;
    }

    try {
      const assetsDir = path.join(__dirname, '../../assets');
      const files = await fs.readdir(assetsDir);
      
      const pngFiles = files.filter(file => file.endsWith('.png'));
      
      const images = [];
      for (const file of pngFiles) {
        const filePath = path.join(assetsDir, file);
        const buffer = await fs.readFile(filePath);
        images.push({
          data: buffer.toString('base64'),
          mimeType: 'image/png',
          filename: file
        });
      }
      
      this.referenceImages = images;
      console.log(`Loaded ${images.length} reference images for validation`);
      return images;
    } catch (error) {
      console.error('Failed to load reference images:', error.message);
      return [];
    }
  }

  async validateDocumentWithReferences(userDocBuffer, userMimeType) {
    if (!this.initialized) {
      throw new Error('Gemini API not initialized');
    }

    try {
      const referenceImages = await this.loadReferenceImages();
      
      if (referenceImages.length === 0) {
        console.warn('No reference images found, skipping stamp validation');
        return { valid: true, confidence: 0, reason: 'No reference images available' };
      }

      const visionModel = this.genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      const userImagePart = {
        inlineData: {
          data: userDocBuffer.toString('base64'),
          mimeType: userMimeType
        }
      };

      const referenceParts = referenceImages.map(img => ({
        inlineData: {
          data: img.data,
          mimeType: img.mimeType
        }
      }));

      const prompt = `
You are validating an academic marksheet for authenticity.

The FIRST image is the USER'S MARKSHEET that needs to be validated.
The REMAINING images are REFERENCE MARKSHEETS from the authentic college with official stamps and signatures.

IMPORTANT: Focus on CONSISTENT elements. IGNORE these VARIABLE elements:
- Holographic seals/holograms (often not visible in photos/scans)
- "Entered by" signature (different staff members enter data)
- Serial numbers (changes for each marksheet)
- Date stamps (will vary per semester)

VALIDATE these CONSISTENT elements:
- College name and official logo
- Document layout and structure
- Principal's signature style and placement
- Controller of Examination's signature style and placement
- Exam Cell I/C signature style (if present)
- Official college stamp/seal (shape and placement, ignore hologram)

Your task:
1. Compare the CONSISTENT signature styles (Principal, Controller, Exam Cell I/C)
2. Verify college name, logo, and format match
3. Check document structure and layout consistency
4. Look for obvious signs of tampering or completely different format

Return ONLY a JSON object with this exact format:
{
  "valid": true/false,
  "confidence": 0-100,
  "reason": "Brief explanation focusing on consistent elements"
}

Confidence guidelines:
- If college name, logo, format, and key signatures (Principal, Controller, Exam Cell I/C) match: valid=true, confidence=75-100
- If mostly matches but some uncertainty: valid=true, confidence=50-74
- If key signatures don't match or wrong college: valid=false, confidence=20-49
- If clearly forged: valid=false, confidence=0-19

Remember: Missing hologram or different "Entered by" signature should NOT reduce confidence if other elements match.

Return ONLY the JSON, nothing else.`;

      const parts = [prompt, userImagePart, ...referenceParts];
      const result = await visionModel.generateContent(parts);
      const response = await result.response;
      const text = response.text().trim();

      let jsonText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const validationResult = JSON.parse(jsonText);

      return {
        valid: validationResult.valid === true,
        confidence: validationResult.confidence || 0,
        reason: validationResult.reason || 'No reason provided'
      };
    } catch (error) {
      console.error('Document validation error:', error.message);
      return { valid: false, confidence: 0, reason: `Validation failed: ${error.message}` };
    }
  }
}

module.exports = new GeminiService();
