const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM asset_categories WHERE status = 1 ORDER BY parent_id, id');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get('/all', async (req, res) => {
  try {
    const categories = await query('SELECT * FROM asset_categories ORDER BY parent_id, id');
    res.json({ success: true, data: categories });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, parent_id, type, description } = req.body;
    const result = await run(
      'INSERT INTO asset_categories (name, parent_id, type, description, updated_at) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [name, parent_id || 0, type || 'office', description || '']
    );
    res.json({ success: true, data: { id: result.lastID } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, parent_id, type, description, status } = req.body;
    const result = await run(
      'UPDATE asset_categories SET name = ?, parent_id = ?, type = ?, description = ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, parent_id || 0, type || 'office', description || '', status, id]
    );
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('UPDATE asset_categories SET status = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [id]);
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;