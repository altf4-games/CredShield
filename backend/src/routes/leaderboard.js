const express = require('express');
const router = express.Router();
const leaderboardService = require('../services/leaderboardService');

/**
 * GET /api/leaderboard
 * Get privacy-aware leaderboard with optional filters
 * 
 * Query params:
 * - branch: Filter by branch (CS, IT, EE, ME, etc.)
 * - year: Filter by academic year (FE, SE, TE, BE or 1-4)
 * - eligibility: Filter by eligibility (all, eligible, not_eligible)
 */
router.get('/', async (req, res) => {
  try {
    const { branch, year, eligibility } = req.query;

    const filters = {};
    if (branch) filters.branch = branch;
    if (year) filters.year = year;
    if (eligibility) filters.eligibility = eligibility;

    const leaderboard = await leaderboardService.getLeaderboard(filters);

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard: leaderboard,
      filters: filters
    });
  } catch (error) {
    console.error('Error in GET /api/leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leaderboard',
      error: error.message
    });
  }
});

/**
 * GET /api/leaderboard/rank/:userId
 * Get student's current rank in leaderboard
 */
router.get('/rank/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const rank = await leaderboardService.getStudentRank(userId);

    if (!rank) {
      return res.status(404).json({
        success: false,
        message: 'Student not found in leaderboard (may not be opted in)'
      });
    }

    res.json({
      success: true,
      rank: rank
    });
  } catch (error) {
    console.error('Error in GET /api/leaderboard/rank/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get student rank',
      error: error.message
    });
  }
});

module.exports = router;
