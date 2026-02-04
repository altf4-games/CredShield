const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiService {
  constructor() {
    this.genAI = null;
    this.model = null;
    this.initialized = false;
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
}

module.exports = new GeminiService();
