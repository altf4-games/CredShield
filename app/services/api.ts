import axios from 'axios';

// const API_URL = __DEV__ 
//   ? 'http://10.0.2.2:3000/api'
//   : 'https://credshield.vercel.app/api';

  const API_URL = 'https://credshield.vercel.app/api';

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
    submitter: string;
    studentName: string;
    threshold: number;
    verified: boolean;
    timestamp: string;
  };
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
   * Get student profile by userId
   */
  async getStudentProfile(userId: string): Promise<any> {
    try {
      const response = await axios.get(`${API_URL}/students/${userId}`);
      return response.data.student;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Get student profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get student profile');
    }
  }

  /**
   * Create or update student profile
   */
  async updateStudentProfile(userId: string, profileData: any): Promise<any> {
    try {
      const response = await axios.post(`${API_URL}/students`, {
        userId,
        ...profileData,
      });
      return response.data.student;
    } catch (error: any) {
      console.error('Update student profile error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update student profile');
    }
  }

  /**
   * Update leaderboard opt-in preferences
   */
  async updateLeaderboardOptIn(userId: string, optIn: boolean, showAnonymous: boolean = false): Promise<any> {
    try {
      const response = await axios.put(`${API_URL}/students/${userId}/opt-in`, {
        optIn,
        showAnonymous,
      });
      return response.data;
    } catch (error: any) {
      console.error('Update leaderboard opt-in error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to update leaderboard preferences');
    }
  }

  /**
   * Get leaderboard with optional filters
   */
  async getLeaderboard(filters?: { branch?: string; year?: string; eligibility?: string }): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.branch) params.append('branch', filters.branch);
      if (filters?.year) params.append('year', filters.year);
      if (filters?.eligibility) params.append('eligibility', filters.eligibility);

      const queryString = params.toString();
      const url = queryString ? `${API_URL}/leaderboard?${queryString}` : `${API_URL}/leaderboard`;

      const response = await axios.get(url);
      return response.data.leaderboard;
    } catch (error: any) {
      console.error('Get leaderboard error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get leaderboard');
    }
  }

  /**
   * Get student's rank in leaderboard
   */
  async getStudentRank(userId: string): Promise<number | null> {
    try {
      const response = await axios.get(`${API_URL}/leaderboard/rank/${userId}`);
      return response.data.rank;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error('Get student rank error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Failed to get student rank');
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
