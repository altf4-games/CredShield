const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: 'Validation Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('GPA')) {
    return res.status(400).json({
      error: 'GPA Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('threshold')) {
    return res.status(400).json({
      error: 'Threshold Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('Proof')) {
    return res.status(400).json({
      error: 'Proof Error',
      message: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('contract')) {
    return res.status(503).json({
      error: 'Blockchain Error',
      message: 'Failed to interact with smart contract',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  if (err.message && err.message.includes('Gemini')) {
    return res.status(503).json({
      error: 'Document Processing Error',
      message: 'Failed to process document',
      details: err.message,
      timestamp: new Date().toISOString()
    });
  }

  return res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : err.message,
    timestamp: new Date().toISOString()
  });
};

const notFoundHandler = (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  errorHandler,
  notFoundHandler
};
