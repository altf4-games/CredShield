const { getConnection } = require('../db/neon');

/**
 * Get privacy-aware leaderboard with optional filters
 */
async function getLeaderboard(filters = {}) {
  const sql = getConnection();
  const { branch, year, eligibility } = filters;

  try {
    // Build dynamic query with filters using tagged templates
    let result;

    if (!branch && !year && (!eligibility || eligibility === 'all')) {
      // No filters - simple query
      result = await sql`
        SELECT 
          id,
          display_name,
          branch,
          academic_year,
          gpa_range,
          is_eligible,
          show_anonymous,
          actual_gpa
        FROM leaderboard_view
        ORDER BY actual_gpa DESC
      `;
    } else {
      // With filters - need to build conditions
      const conditions = [];
      
      // Always include opt-in check (already in view, but being explicit)
      if (branch) {
        result = await sql`
          SELECT 
            id,
            display_name,
            branch,
            academic_year,
            gpa_range,
            is_eligible,
            show_anonymous,
            actual_gpa
          FROM leaderboard_view
          WHERE branch = ${branch}
            ${year ? sql`AND academic_year = ${year}` : sql``}
            ${eligibility && eligibility !== 'all' ? sql`AND is_eligible = ${eligibility === 'eligible'}` : sql``}
          ORDER BY actual_gpa DESC
        `;
      } else if (year) {
        result = await sql`
          SELECT 
            id,
            display_name,
            branch,
            academic_year,
            gpa_range,
            is_eligible,
            show_anonymous,
            actual_gpa
          FROM leaderboard_view
          WHERE academic_year = ${year}
            ${eligibility && eligibility !== 'all' ? sql`AND is_eligible = ${eligibility === 'eligible'}` : sql``}
          ORDER BY actual_gpa DESC
        `;
      } else if (eligibility && eligibility !== 'all') {
        result = await sql`
          SELECT 
            id,
            display_name,
            branch,
            academic_year,
            gpa_range,
            is_eligible,
            show_anonymous,
            actual_gpa
          FROM leaderboard_view
          WHERE is_eligible = ${eligibility === 'eligible'}
          ORDER BY actual_gpa DESC
        `;
      }
    }

    // Add rank to each entry (actual_gpa not exposed to frontend)
    const leaderboard = result.map((entry, index) => ({
      id: entry.id,
      displayName: entry.display_name,
      branch: entry.branch,
      academicYear: entry.academic_year,
      gpaRange: entry.gpa_range,  // Privacy: Range only, not exact value
      isEligible: entry.is_eligible,
      rank: index + 1
    }));

    return leaderboard;
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    throw error;
  }
}

/**
 * Get student's rank in leaderboard (if opted in)
 */
async function getStudentRank(userId) {
  const sql = getConnection();

  try {
    const result = await sql`
      WITH ranked_students AS (
        SELECT 
          user_id,
          ROW_NUMBER() OVER (ORDER BY actual_gpa DESC) as rank
        FROM leaderboard_view
      )
      SELECT rank
      FROM ranked_students
      WHERE user_id = ${userId}
    `;

    return result[0]?.rank || null;
  } catch (error) {
    console.error('Error getting student rank:', error);
    throw error;
  }
}

module.exports = {
  getLeaderboard,
  getStudentRank
};
