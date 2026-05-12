const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, user_id = '', status = '' } = req.query;
    let sql = 'SELECT a.*, u.name as user_name, u.department, ast.name as asset_name, ast.asset_code FROM apply a LEFT JOIN users u ON a.user_id = u.id LEFT JOIN assets ast ON a.asset_code = ast.asset_code WHERE 1=1';
    const params = [];
    
    if (user_id) {
      sql += ' AND a.user_id = ?';
      params.push(user_id);
    }
    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }
    
    sql += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const applies = await query(sql, params);
    
    const countSql = 'SELECT COUNT(*) as total FROM apply WHERE 1=1' + 
      (user_id ? ' AND user_id = ?' : '') + 
      (status ? ' AND status = ?' : '');
    const countParams = [...params.slice(0, -2)];
    const count = await query(countSql, countParams);
    
    res.json({ success: true, data: applies, total: count[0].total });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const applies = await query('SELECT a.*, u.name as user_name, u.department FROM apply a LEFT JOIN users u ON a.user_id = u.id WHERE a.id = ?', [id]);
    res.json({ success: true, data: applies[0] });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { user_id, asset_code, quantity, purpose, apply_time } = req.body;
    
    const assets = await query('SELECT * FROM assets WHERE asset_code = ?', [asset_code]);
    if (assets.length === 0) {
      return res.json({ success: false, message: '资产不存在' });
    }
    
    if (assets[0].quantity < quantity) {
      return res.json({ success: false, message: '库存不足' });
    }
    
    const apply_no = 'APL' + Date.now().toString().slice(-8);
    const result = await run(
      'INSERT INTO apply (apply_no, user_id, asset_code, quantity, purpose, apply_time, updated_at) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
      [apply_no, user_id, asset_code, quantity, purpose || '', apply_time || new Date().toISOString()]
    );
    
    await run(
      'INSERT INTO approval (apply_id, approver_id, level, status) VALUES (?, ?, 1, ?)',
      [result.lastID, 1, 'pending']
    );
    
    res.json({ success: true, data: { id: result.lastID, apply_no } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { asset_code, quantity, purpose, apply_time } = req.body;
    const result = await run(
      'UPDATE apply SET asset_code = ?, quantity = ?, purpose = ?, apply_time = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [asset_code, quantity, purpose || '', apply_time || new Date().toISOString(), id]
    );
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await run('DELETE FROM apply WHERE id = ?', [id]);
    res.json({ success: true, data: { changes: result.changes } });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;