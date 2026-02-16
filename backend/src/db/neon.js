const { neon } = require('@neondatabase/serverless');

// Initialize Neon connection
let sql;

function getConnection() {
  if (!sql) {
    const connectionString = process.env.DATABASE_URL;
    
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    
    sql = neon(connectionString);
  }
  
  return sql;
}

// Query helper function
async function query(text, params = []) {
  try {
    const sql = getConnection();
    const result = await sql(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Test connection
async function testConnection() {
  try {
    const sql = getConnection();
    await sql`SELECT 1`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

module.exports = {
  query,
  getConnection,
  testConnection
};
