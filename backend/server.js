require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const expertRequestRoutes = require('./routes/expertRequests');

const app = express();

// CLIENT_URL may hold several comma separated origins (local + deployed)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5180')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// slow down password guessing on the login endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'error', message: 'Too many attempts, please try again later' },
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cyber Goyenda API is running' });
});

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/expert-requests', expertRequestRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ status: 'error', message: 'Route not found' });
});

// Generic error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.PORT || 5050;
const server = http.createServer(app);

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Cyber Goyenda API listening on http://localhost:${PORT}`);
  });
}

module.exports = { app, server };
