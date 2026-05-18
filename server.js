const express = require('express');
const app = express();
const port = 3000;

const TIMEZONE = 'Australia/Brisbane'; // UTC+10, no DST. Use 'Australia/Sydney' if you need DST.

// Middleware to parse JSON
app.use(express.json());

// Helper: extract individual date parts in UTC+10
function getUTC10Parts(date) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).formatToParts(date);

  const get = (type) => parts.find(p => p.type === type)?.value;

  return {
    day: parseInt(get('day'), 10),
    month: get('month'),
    year: parseInt(get('year'), 10),
    dayOfWeek: get('weekday')
  };
}

// Helper: YYYY-MM-DD in UTC+10
function toUTC10DateString(date) {
  return date.toLocaleDateString('en-CA', { timeZone: TIMEZONE });
}

// Helper: ISO-8601 timestamp with explicit +10:00 offset
function toUTC10ISOString(date) {
  const shifted = new Date(date.getTime() + 10 * 60 * 60 * 1000);
  return shifted.toISOString().replace('Z', '+10:00');
}

// Helper: month number (1-12) in UTC+10
function getUTC10MonthNumber(date) {
  return parseInt(
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, month: 'numeric' }).format(date),
    10
  );
}

// Helper function to format date response
function formatDateResponse(currentDate, futureDate, daysToAdd) {
  const { day, month, year, dayOfWeek } = getUTC10Parts(futureDate);

  return {
    timezone: 'UTC+10',
    current_date: toUTC10DateString(currentDate),
    days_added: daysToAdd,
    future_date: toUTC10DateString(futureDate),
    formatted_date: futureDate.toLocaleDateString('en-US', {
      timeZone: TIMEZONE,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    formatted_date_no_year: futureDate.toLocaleDateString('en-US', {
      timeZone: TIMEZONE,
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    }),
    day_of_week: dayOfWeek,
    day,
    month,
    month_number: getUTC10MonthNumber(futureDate),
    year,
    timestamp: toUTC10ISOString(futureDate)
  };
}

// Shared validation logic
function validateDays(days, queryParam = false) {
  if (isNaN(days)) {
    return {
      error: 'Invalid days parameter',
      message: queryParam
        ? 'Please provide a valid number of days using ?days=X'
        : 'Days must be a valid number'
    };
  }
  if (days < 0 || days > 365) {
    return { error: 'Days out of range', message: 'Days must be between 0 and 365' };
  }
  return null;
}

// API endpoint to get date X days from now (path param)
app.get('/api/date/plus/:days', (req, res) => {
  try {
    const daysToAdd = parseInt(req.params.days);
    const validationError = validateDays(daysToAdd);
    if (validationError) return res.status(400).json(validationError);

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    res.json(formatDateResponse(currentDate, futureDate, daysToAdd));
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate date', message: error.message });
  }
});

// Alternative query parameter endpoint
app.get('/api/date/plus', (req, res) => {
  try {
    const daysToAdd = parseInt(req.query.days);
    const validationError = validateDays(daysToAdd, true);
    if (validationError) return res.status(400).json(validationError);

    const currentDate = new Date();
    const futureDate = new Date(currentDate.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    res.json(formatDateResponse(currentDate, futureDate, daysToAdd));
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate date', message: error.message });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timezone: 'UTC+10',
    timestamp: toUTC10ISOString(new Date())
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Date API running at http://localhost:${port} (UTC+10)`);
  console.log(`Try: http://localhost:${port}/api/date/plus/3`);
  console.log(`Or: http://localhost:${port}/api/date/plus?days=7`);
});

module.exports = app;