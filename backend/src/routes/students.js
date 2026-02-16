const express = require('express');
const router = express.Router();
const studentService = require('../services/studentService');

/**
 * POST /api/students
 * Create or update student profile
 */
router.post('/', async (req, res) => {
  try {
    const { userId, ...profileData } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    if (!profileData.name) {
      return res.status(400).json({
        success: false,
        message: 'name is required'
      });
    }

    const student = await studentService.createOrUpdateStudent(userId, profileData);

    res.json({
      success: true,
      student: {
        id: student.id,
        userId: student.user_id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        academicYear: student.academic_year,
        gpa: student.gpa,
        skills: student.skills,
        resumeUrl: student.resume_url,
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
        isVerified: student.is_verified,
        isEligible: student.is_eligible,
        leaderboardOptIn: student.leaderboard_opt_in,
        showAnonymous: student.show_anonymous
      }
    });
  } catch (error) {
    console.error('Error in POST /api/students:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create/update student profile',
      error: error.message
    });
  }
});

/**
 * GET /api/students/:userId
 * Get student profile
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const student = await studentService.getStudentProfile(userId);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    res.json({
      success: true,
      student: {
        id: student.id,
        userId: student.user_id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        academicYear: student.academic_year,
        gpa: student.gpa,
        skills: student.skills,
        resumeUrl: student.resume_url,
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
        isVerified: student.is_verified,
        isEligible: student.is_eligible,
        leaderboardOptIn: student.leaderboard_opt_in,
        showAnonymous: student.show_anonymous,
        createdAt: student.created_at,
        updatedAt: student.updated_at
      }
    });
  } catch (error) {
    console.error('Error in GET /api/students/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student profile',
      error: error.message
    });
  }
});

/**
 * PUT /api/students/:userId
 * Update student profile
 */
router.put('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const profileData = req.body;

    const student = await studentService.createOrUpdateStudent(userId, profileData);

    res.json({
      success: true,
      student: {
        id: student.id,
        userId: student.user_id,
        name: student.name,
        email: student.email,
        branch: student.branch,
        academicYear: student.academic_year,
        gpa: student.gpa,
        skills: student.skills,
        resumeUrl: student.resume_url,
        linkedinUrl: student.linkedin_url,
        githubUrl: student.github_url,
        portfolioUrl: student.portfolio_url,
        isVerified: student.is_verified,
        isEligible: student.is_eligible
      }
    });
  } catch (error) {
    console.error('Error in PUT /api/students/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update student profile',
      error: error.message
    });
  }
});

/**
 * PUT /api/students/:userId/opt-in
 * Update leaderboard opt-in preferences
 */
router.put('/:userId/opt-in', async (req, res) => {
  try {
    const { userId } = req.params;
    const { optIn, showAnonymous } = req.body;

    if (typeof optIn !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'optIn must be a boolean'
      });
    }

    const result = await studentService.updateLeaderboardOptIn(
      userId,
      optIn,
      showAnonymous || false
    );

    res.json({
      success: true,
      leaderboardOptIn: result.leaderboard_opt_in,
      showAnonymous: result.show_anonymous
    });
  } catch (error) {
    console.error('Error in PUT /api/students/:userId/opt-in:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update leaderboard opt-in',
      error: error.message
    });
  }
});

/**
 * GET /api/students/:userId/leaderboard-status
 * Get leaderboard opt-in status
 */
router.get('/:userId/leaderboard-status', async (req, res) => {
  try {
    const { userId } = req.params;

    const status = await studentService.getLeaderboardStatus(userId);

    res.json({
      success: true,
      leaderboardOptIn: status.leaderboard_opt_in,
      showAnonymous: status.show_anonymous
    });
  } catch (error) {
    console.error('Error in GET /api/students/:userId/leaderboard-status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard status',
      error: error.message
    });
  }
});

module.exports = router;
