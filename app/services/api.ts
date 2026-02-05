import axios from 'axios';

// Backend URL - update this to your backend URL
const API_URL = 'http://10.0.2.2:3000/api';

export interface ProofGenerationResponse {
  success: boolean;
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
    protocol: string;
    curve: string;
  };
  publicSignals: string[];
  verificationCode: string;
  studentName: string;
  extractedGPA: number;
  metadata: {
    threshold: number;
    meetsRequirement: boolean;
    generated: string;
  };
  message: string;
  fileType: string;
  proofHash: string;
  verificationUrl: string;
}

export interface VerificationResponse {
  success: boolean;
  verified: boolean;
  code: string;
  metadata: {
    studentName: string;
    threshold: number;
    meetsRequirement: boolean;
    generated: string;
    extractedGPA: number;
    fileType: string;
  };
  txHash: string;
  blockNumber: number;
  timestamp: string;
  message: string;
}

class ApiService {
  /**
   * Generate proof from uploaded document
   */
  async generateProof(fileUri: string, fileType: 'image' | 'pdf', threshold: number): Promise<ProofGenerationResponse> {
    try {
      const formData = new FormData();
      
      // Create file object
      const file = {
        uri: fileUri,
        type: fileType === 'pdf' ? 'application/pdf' : 'image/jpeg',
        name: fileType === 'pdf' ? 'document.pdf' : 'photo.jpg',
      } as any;

      formData.append('document', file);
      formData.append('threshold', threshold.toString());

      console.log('Uploading to:', `${API_URL}/proof/generate-from-document`);
      console.log('Threshold:', threshold);

      const response = await axios.post(`${API_URL}/proof/generate-from-document`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 60000, // 60 second timeout for AI processing
      });

      console.log('API Response:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error: any) {
      console.error('Generate proof error:', error.response?.data || error.message);
      console.error('Full error:', error);
      throw new Error(error.response?.data?.error || error.message || 'Failed to generate proof');
    }
  }

  /**
   * Verify proof using verification code
   */
  async verifyProof(code: string): Promise<VerificationResponse> {
    try {
      const response = await axios.post(`${API_URL}/proof/verify-code`, {
        code: code.toUpperCase(),
      });

      return response.data;
    } catch (error: any) {
      console.error('Verify proof error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to verify proof');
    }
  }

  /**
   * Health check
   */
  async checkHealth(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
      return response.data.status === 'healthy';
    } catch (error) {
      return false;
    }
  }
}

export default new ApiService();
