const pdf = require('pdf-parse');

class PDFService {
  async extractTextFromPDF(buffer) {
    try {
      const data = await pdf(buffer);
      return data.text;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error.message}`);
    }
  }

  async processAcademicPDF(buffer) {
    const text = await this.extractTextFromPDF(buffer);
    
    if (!text || text.trim().length < 10) {
      throw new Error('PDF appears to be empty or could not be read');
    }

    return text;
  }
}

module.exports = new PDFService();
