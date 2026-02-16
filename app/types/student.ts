export interface StudentProfile {
  id: number;
  userId: string;
  name: string;
  email?: string;
  branch: string;
  academicYear: string;
  gpa: number;
  skills: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  isVerified: boolean;
  isEligible: boolean;
  leaderboardOptIn: boolean;
  showAnonymous: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface LeaderboardEntry {
  id: number;
  displayName: string;
  branch: string;
  academicYear: string;
  gpaRange: string;
  isEligible: boolean;
  rank: number;
}

export interface LeaderboardFilters {
  branch?: string;
  year?: string;
  eligibility?: 'all' | 'eligible' | 'not_eligible';
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  branch?: string;
  academicYear?: string;
  gpa?: number;
  skills?: string[];
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}
