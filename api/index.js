const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { getPool } = require('./db');
const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'kitchen is alive' });
});

app.use('/api/auth', authRoutes);
app.use('/api/todos', todoRoutes);

app.get('/api/db-test', async (req, res) => {
  try {
    const pool = getPool();
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({ dbConnected: true, result: rows[0].result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ dbConnected: false, error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;