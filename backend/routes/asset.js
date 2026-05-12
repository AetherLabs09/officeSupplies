const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, keyword = '', category_id = '' } = req.query;
    let sql = 'SELECT a.*, c.name as category_name FROM assets a LEFT JOIN asset_categories c ON a.category_id = c.id WHERE 1=1';
    const params = [];
    
    if (keyword) {
      sql += ' AND (a.name LIKE ? OR a.asset_code LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`);
    }
    if (category_id) {
      sql += ' AND a.category_id = ?';
      params.push(category_id);
    }
    
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const assets = await query(sql, params);
    
    const countSql = 'SELECT COUNT(*) as total FROM assets WHERE 1=1' + 
      (keyword ? ' AND (name LIKE ? OR asset_code LIKE ?)' : '') + 
      (category_id ? ' AND category_id = ?' : '');
    const countParams = [...params.slice(0, -2)];
    const count = await query(countSql, countParams);
    
    res.json({ success: true, data: assets, total: count[0].total });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const assets = await query('SELECT * FROM assets WHERE id = ?', [id]);
    res.json({ success: true, data: assets[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, model, brand, purchase_price, purchase_date, supplier, location, category_id, quantity, description } = req.body;
    const asset_code = 'AST' + Date.now().toString().slice(-8);
    const result = await run(
      'INSERT INTO assets (asset_code, name, model, brand, purchase_price, purchase_date, supplier, location, category_id, quantity, description, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [asset_code, name, model || '', brand || '', purchase_price || 0, purchase_date || '', supplier || '', location || '', category_id || 0, quantity || 1, description || '']
    );
    res.json({ success: true, data: { id: result.lastID, asset_code } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, model, brand, purchase_price, purchase_date, supplier, location, status, category_id, quantity, description } = req.body;
    const result = await run(
      'UPDATE assets SET name = ?, model = ?, brand = ?, purchase_price = ?, purchase_date = ?, supplier = ?, location = ?, status = ?, category_id = ?, quantity = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [name, model || '', brand || '', purchase_price || 0, purchase_date || '', supplier || '', location || '', status || 'in_stock', category_id || 0, quantity || 1, description || '', id]
    );
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM assets WHERE id = ?', [id]);
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;