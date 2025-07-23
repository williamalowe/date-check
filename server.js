const express = require('express');
const app = express();
const port = 3000;

// Middleware to parse JSON
app.use(express.json());

// API endpoint to get date X days from now
app.get('/api/date/plus/:days', (req, res) => {
  try {
    const daysToAdd = parseInt(req.params.days);
    
    // Validation
    if (isNaN(daysToAdd)) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Days must be a valid number'
      });
    }
    
    if (daysToAdd < 0 || daysToAdd > 365) {
      return res.status(400).json({
        error: 'Days out of range',
        message: 'Days must be between 0 and 365'
      });
    }
    
    // Get current date
    const currentDate = new Date();
    
    // Add specified days
    const futureDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    
    // Format the response
    const response = {
      current_date: currentDate.toISOString().split('T')[0],
      days_added: daysToAdd,
      future_date: futureDate.toISOString().split('T')[0],
      formatted_date: futureDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      timestamp: futureDate.toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate date',
      message: error.message 
    });
  }
});

// Alternative query parameter endpoint
app.get('/api/date/plus', (req, res) => {
  try {
    const daysToAdd = parseInt(req.query.days);
    
    // Validation
    if (isNaN(daysToAdd)) {
      return res.status(400).json({
        error: 'Invalid days parameter',
        message: 'Please provide a valid number of days using ?days=X'
      });
    }
    
    if (daysToAdd < 0 || daysToAdd > 365) {
      return res.status(400).json({
        error: 'Days out of range',
        message: 'Days must be between 0 and 365'
      });
    }
    
    // Get current date
    const currentDate = new Date();
    
    // Add specified days
    const futureDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    
    // Format the response
    const response = {
      current_date: currentDate.toISOString().split('T')[0],
      days_added: daysToAdd,
      future_date: futureDate.toISOString().split('T')[0],
      formatted_date: futureDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      timestamp: futureDate.toISOString()
    };
    
    res.json(response);
  } catch (error) {
    res.status(500).json({ 
      error: 'Failed to calculate date',
      message: error.message 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString() 
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Date API running at http://localhost:${port}`);
  console.log(`Try: http://localhost:${port}/api/date/plus/3`);
  console.log(`Or: http://localhost:${port}/api/date/plus?days=7`);
});

module.exports = app;