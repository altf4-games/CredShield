#!/usr/bin/env node

/**
 * Clear all recruiter interactions script
 * This will delete all swipe decisions from the database
 * Useful for testing and resetting the swipe state
 */

require('dotenv').config();
const { getConnection } = require('../src/db/neon');

async function clearInteractions() {
  const sql = getConnection();
  
  try {
    console.log('Clearing all recruiter interactions...');
    
    // Get count before deletion
    const countBefore = await sql`
      SELECT COUNT(*) as count FROM recruiter_interactions
    `;
    
    const beforeCount = parseInt(countBefore[0].count);
    console.log(`Current interactions: ${beforeCount}`);
    
    if (beforeCount === 0) {
      console.log('No interactions to clear!');
      process.exit(0);
    }
    
    // Delete all interactions
    await sql`
      DELETE FROM recruiter_interactions
    `;
    
    // Verify deletion
    const countAfter = await sql`
      SELECT COUNT(*) as count FROM recruiter_interactions
    `;
    
    const afterCount = parseInt(countAfter[0].count);
    
    console.log(`Successfully cleared ${beforeCount} interactions`);
    console.log(`Remaining interactions: ${afterCount}`);
    
    if (afterCount === 0) {
      console.log('All recruiter interactions have been cleared!');
    } else {
      console.log('Warning: Some interactions may still remain');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('Error clearing interactions:', error);
    process.exit(1);
  }
}

// Run the script
clearInteractions();
