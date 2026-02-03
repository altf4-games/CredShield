const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const proofRoutes = require('./routes/proof');
const geminiService = require('./services/geminiService');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

geminiService.initialize();

app.get('/', (req, res) => {
  res.json({
    message: 'CredShield Backend API',
    status: 'running',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      proof: '/api/proof'
    }
  });
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      api: 'operational',
      blockchain: process.env.CONTRACT_ADDRESS ? 'configured' : 'not configured',
      gemini: process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' 
        ? 'configured' 
        : 'not configured'
    }
  });
});

app.use('/api/proof', proofRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Contract: ${process.env.CONTRACT_ADDRESS || 'Not configured'}`);
});
