require('dotenv').config();
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const incidentRoutes = require('./routes/incidents');
const expertRequestRoutes = require('./routes/expertRequests');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5180' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Cyber Goyenda API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/incidents', incidentRoutes);
app.use('/api/expert-requests', expertRequestRoutes);
app.use('/api/admin', adminRoutes);

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
app.listen(PORT, () => {
  console.log(`Cyber Goyenda API listening on http://localhost:${PORT}`);
});
