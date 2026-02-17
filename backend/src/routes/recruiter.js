const express = require('express');
const router = express.Router();
const recruiterService = require('../services/recruiterService');

/**
 * GET /api/recruiter/candidates/:recruiterId
 * Get candidates that recruiter hasn't swiped on yet
 */
router.get('/candidates/:recruiterId', async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const candidates = await recruiterService.getCandidates(recruiterId);
    
    res.json({
      success: true,
      candidates,
      count: candidates.length,
    });
  } catch (error) {
    console.error('Get candidates error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get candidates',
    });
  }
});

/**
 * POST /api/recruiter/interactions
 * Save recruiter swipe action
 * Body: { recruiterId, studentUserId, action: 'skip' | 'interested' }
 */
router.post('/interactions', async (req, res) => {
  try {
    const { recruiterId, studentUserId, action } = req.body;
    
    if (!recruiterId || !studentUserId || !action) {
      return res.status(400).json({
        success: false,
        error: 'recruiterId, studentUserId, and action are required',
      });
    }
    
    if (action !== 'skip' && action !== 'interested') {
      return res.status(400).json({
        success: false,
        error: 'action must be either "skip" or "interested"',
      });
    }
    
    await recruiterService.saveInteraction(recruiterId, studentUserId, action);
    
    res.json({
      success: true,
      message: `Interaction saved: ${action}`,
    });
  } catch (error) {
    console.error('Save interaction error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to save interaction',
    });
  }
});

/**
 * GET /api/recruiter/shortlisted/:recruiterId
 * Get students recruiter marked as interested
 */
router.get('/shortlisted/:recruiterId', async (req, res) => {
  try {
    const { recruiterId } = req.params;
    const shortlisted = await recruiterService.getShortlisted(recruiterId);
    
    res.json({
      success: true,
      candidates: shortlisted,
      count: shortlisted.length,
    });
  } catch (error) {
    console.error('Get shortlisted error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get shortlisted candidates',
    });
  }
});

module.exports = router;
