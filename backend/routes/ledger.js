const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, asset_code = '', type = '' } = req.query;
    let sql = 'SELECT l.*, a.name as asset_name FROM ledger l LEFT JOIN assets a ON l.asset_code = a.asset_code WHERE 1=1';
    const params = [];
    
    if (asset_code) {
      sql += ' AND l.asset_code LIKE ?';
      params.push(`%${asset_code}%`);
    }
    if (type) {
      sql += ' AND l.type = ?';
      params.push(type);
    }
    
    sql += ' ORDER BY l.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
    
    const ledger = await query(sql, params);
    
    const countSql = 'SELECT COUNT(*) as total FROM ledger WHERE 1=1' + 
      (asset_code ? ' AND asset_code LIKE ?' : '') + 
      (type ? ' AND type = ?' : '');
    const countParams = [...params.slice(0, -2)];
    const count = await query(countSql, countParams);
    
    res.json({ success: true, data: ledger, total: count[0].total });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/return', async (req, res) => {
  try {
    const { asset_code, quantity, operator, remark } = req.body;
    
    await run('UPDATE assets SET quantity = quantity + ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE asset_code = ?', [quantity, 'in_stock', asset_code]);
    
    await run(
      'INSERT INTO ledger (asset_code, type, quantity, operator, remark) VALUES (?, ?, ?, ?, ?)',
      [asset_code, '归还', quantity, operator || '', remark || '']
    );
    
    res.json({ success: true, message: '归还成功' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/transfer', async (req, res) => {
  try {
    const { asset_code, quantity, operator, location, remark } = req.body;
    
    await run('UPDATE assets SET location = ?, updated_at = CURRENT_TIMESTAMP WHERE asset_code = ?', [location, asset_code]);
    
    await run(
      'INSERT INTO ledger (asset_code, type, quantity, operator, remark) VALUES (?, ?, ?, ?, ?)',
      [asset_code, '调拨', quantity, operator || '', remark || '']
    );
    
    res.json({ success: true, message: '调拨成功' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/scrap', async (req, res) => {
  try {
    const { asset_code, quantity, operator, remark } = req.body;
    
    await run('UPDATE assets SET quantity = quantity - ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE asset_code = ?', [quantity, 'scrapped', asset_code]);
    
    await run(
      'INSERT INTO ledger (asset_code, type, quantity, operator, remark) VALUES (?, ?, ?, ?, ?)',
      [asset_code, '报废', quantity, operator || '', remark || '']
    );
    
    res.json({ success: true, message: '报废成功' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;