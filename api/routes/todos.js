const express = require('express');
const { getPool } = require('../db');
const requireAuth = require('../middleware/auth');

const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const [todos] = await pool.query(
      'SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
    res.json(todos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.post('/', async (req, res) => {
  const { title } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: 'Title is required' });
  }

  try {
    const pool = getPool();
    const [result] = await pool.query(
      'INSERT INTO todos (user_id, title) VALUES (?, ?)',
      [req.userId, title.trim()]
    );
    res.status(201).json({
      id: result.insertId,
      user_id: req.userId,
      title: title.trim(),
      is_completed: false,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, is_completed } = req.body;

  try {
    const pool = getPool();

    const [existing] = await pool.query(
      'SELECT * FROM todos WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const newTitle = title !== undefined ? title.trim() : existing[0].title;
    const newCompleted = is_completed !== undefined ? is_completed : existing[0].is_completed;

    await pool.query(
      'UPDATE todos SET title = ?, is_completed = ? WHERE id = ? AND user_id = ?',
      [newTitle, newCompleted, id, req.userId]
    );

    res.json({ id: Number(id), title: newTitle, is_completed: newCompleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const pool = getPool();
    const [result] = await pool.query(
      'DELETE FROM todos WHERE id = ? AND user_id = ?',
      [id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;