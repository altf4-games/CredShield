const { getConnection } = require('../db/neon');

/**
 * Create or update student profile
 */
async function createOrUpdateStudent(userId, profileData) {
  const sql = getConnection();
  
  const {
    name,
    email,
    branch,
    academicYear,
    gpa,
    skills = [],
    resumeUrl,
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    isVerified = false,
    isEligible = false
  } = profileData;

  try {
    // Upsert student profile
    const result = await sql`
      INSERT INTO students (
        user_id, name, email, branch, academic_year, gpa, skills,
        resume_url, linkedin_url, github_url, portfolio_url,
        is_verified, is_eligible
      ) VALUES (
        ${userId}, ${name}, ${email}, ${branch}, ${academicYear}, ${gpa}, ${skills},
        ${resumeUrl}, ${linkedinUrl}, ${githubUrl}, ${portfolioUrl},
        ${isVerified}, ${isEligible}
      )
      ON CONFLICT (user_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        branch = EXCLUDED.branch,
        academic_year = EXCLUDED.academic_year,
        gpa = EXCLUDED.gpa,
        skills = EXCLUDED.skills,
        resume_url = EXCLUDED.resume_url,
        linkedin_url = EXCLUDED.linkedin_url,
        github_url = EXCLUDED.github_url,
        portfolio_url = EXCLUDED.portfolio_url,
        is_verified = EXCLUDED.is_verified,
        is_eligible = EXCLUDED.is_eligible,
        updated_at = CURRENT_TIMESTAMP
      RETURNING *
    `;

    return result[0];
  } catch (error) {
    console.error('Error creating/updating student:', error);
    throw error;
  }
}

/**
 * Get student profile by userId
 */
async function getStudentProfile(userId) {
  const sql = getConnection();
  
  try {
    const result = await sql`
      SELECT 
        id, user_id, name, email, branch, academic_year, gpa, skills,
        resume_url, linkedin_url, github_url, portfolio_url,
        is_verified, is_eligible, leaderboard_opt_in, show_anonymous,
        created_at, updated_at
      FROM students
      WHERE user_id = ${userId}
    `;

    return result[0] || null;
  } catch (error) {
    console.error('Error getting student profile:', error);
    throw error;
  }
}

/**
 * Update leaderboard opt-in preferences
 */
async function updateLeaderboardOptIn(userId, optIn, showAnonymous = false) {
  const sql = getConnection();
  
  try {
    // First, ensure the student record exists (create if not)
    await sql`
      INSERT INTO students (user_id, leaderboard_opt_in, show_anonymous)
      VALUES (${userId}, ${optIn}, ${showAnonymous})
      ON CONFLICT (user_id) DO UPDATE SET
        leaderboard_opt_in = ${optIn},
        show_anonymous = ${showAnonymous},
        updated_at = CURRENT_TIMESTAMP
    `;

    // Then fetch and return the current settings
    const result = await sql`
      SELECT leaderboard_opt_in, show_anonymous
      FROM students
      WHERE user_id = ${userId}
    `;

    return result[0];
  } catch (error) {
    console.error('Error updating leaderboard opt-in:', error);
    throw error;
  }
}

/**
 * Get leaderboard opt-in status
 */
async function getLeaderboardStatus(userId) {
  const sql = getConnection();
  
  try {
    const result = await sql`
      SELECT leaderboard_opt_in, show_anonymous
      FROM students
      WHERE user_id = ${userId}
    `;

    return result[0] || { leaderboard_opt_in: false, show_anonymous: false };
  } catch (error) {
    console.error('Error getting leaderboard status:', error);
    throw error;
  }
}

module.exports = {
  createOrUpdateStudent,
  getStudentProfile,
  updateLeaderboardOptIn,
  getLeaderboardStatus
};
