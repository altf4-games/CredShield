const { getConnection } = require('../db/neon');

/**
 * Get candidates that recruiter hasn't swiped on yet
 */
async function getCandidates(recruiterId) {
  const sql = getConnection();
  
  try {
    console.log(`[SERVICE] getCandidates called for recruiterId: ${recruiterId}`);
    
    const result = await sql`
      SELECT 
        s.user_id,
        s.name,
        s.gpa,
        s.skills,
        s.linkedin_url,
        s.github_url,
        s.portfolio_url,
        s.is_eligible,
        s.is_verified,
        CASE
          WHEN s.gpa >= 9.50 THEN '9.5-10.0'
          WHEN s.gpa >= 9.00 THEN '9.0-9.5'
          WHEN s.gpa >= 8.50 THEN '8.5-9.0'
          WHEN s.gpa >= 8.00 THEN '8.0-8.5'
          WHEN s.gpa >= 7.50 THEN '7.5-8.0'
          WHEN s.gpa >= 7.00 THEN '7.0-7.5'
          WHEN s.gpa >= 6.50 THEN '6.5-7.0'
          ELSE '6.0-6.5'
        END as gpa_range
      FROM students s
      WHERE s.leaderboard_opt_in = true
        AND NOT EXISTS (
          SELECT 1 
          FROM recruiter_interactions ri 
          WHERE ri.recruiter_id = ${recruiterId} 
            AND ri.student_user_id = s.user_id
        )
      ORDER BY s.gpa DESC
      LIMIT 50
    `;

    console.log(`[SERVICE] Query returned ${result.length} rows`);
    if (result.length > 0) {
      console.log('[SERVICE] Sample result:', result[0].name, result[0].user_id);
    }

    return result.map(student => ({
      userId: student.user_id,
      name: student.name,
      gpaRange: student.gpa_range,
      skills: student.skills || [],
      linkedinUrl: student.linkedin_url,
      githubUrl: student.github_url,
      portfolioUrl: student.portfolio_url,
      isEligible: student.is_eligible,
      isVerified: student.is_verified,
    }));
  } catch (error) {
    console.error('[SERVICE] Error getting candidates:', error);
    throw error;
  }
}

/**
 * Save recruiter swipe interaction
 */
async function saveInteraction(recruiterId, studentUserId, action) {
  const sql = getConnection();
  
  try {
    await sql`
      INSERT INTO recruiter_interactions (recruiter_id, student_user_id, action)
      VALUES (${recruiterId}, ${studentUserId}, ${action})
      ON CONFLICT (recruiter_id, student_user_id) 
      DO UPDATE SET action = ${action}, created_at = CURRENT_TIMESTAMP
    `;
    
    return { success: true };
  } catch (error) {
    console.error('Error saving interaction:', error);
    throw error;
  }
}

/**
 * Get shortlisted candidates (interested)
 */
async function getShortlisted(recruiterId) {
  const sql = getConnection();
  
  try {
    const result = await sql`
      SELECT 
        s.user_id,
        s.name,
        s.email,
        s.gpa,
        s.skills,
        s.linkedin_url,
        s.github_url,
        s.portfolio_url,
        s.is_eligible,
        s.is_verified,
        ri.created_at as shortlisted_at,
        CASE
          WHEN s.gpa >= 9.50 THEN '9.5-10.0'
          WHEN s.gpa >= 9.00 THEN '9.0-9.5'
          WHEN s.gpa >= 8.50 THEN '8.5-9.0'
          WHEN s.gpa >= 8.00 THEN '8.0-8.5'
          WHEN s.gpa >= 7.50 THEN '7.5-8.0'
          WHEN s.gpa >= 7.00 THEN '7.0-7.5'
          WHEN s.gpa >= 6.50 THEN '6.5-7.0'
          ELSE '6.0-6.5'
        END as gpa_range
      FROM recruiter_interactions ri
      JOIN students s ON ri.student_user_id = s.user_id
      WHERE ri.recruiter_id = ${recruiterId}
        AND ri.action = 'interested'
      ORDER BY ri.created_at DESC
    `;

    return result.map(student => ({
      userId: student.user_id,
      name: student.name,
      email: student.email,
      gpaRange: student.gpa_range,
      skills: student.skills || [],
      linkedinUrl: student.linkedin_url,
      githubUrl: student.github_url,
      portfolioUrl: student.portfolio_url,
      isEligible: student.is_eligible,
      isVerified: student.is_verified,
      shortlistedAt: student.shortlisted_at,
    }));
  } catch (error) {
    console.error('Error getting shortlisted candidates:', error);
    throw error;
  }
}

module.exports = {
  getCandidates,
  saveInteraction,
  getShortlisted,
};
