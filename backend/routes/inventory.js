const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const sql = 'SELECT * FROM inventory ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const inventory = await query(sql, [parseInt(limit), (parseInt(page) - 1) * parseInt(limit)]);
    
    const count = await query('SELECT COUNT(*) as total FROM inventory');
    
    res.json({ success: true, data: inventory, total: count[0].total });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/in', async (req, res) => {
  try {
    const { asset_code, quantity, operator, remark } = req.body;
    
    const assets = await query('SELECT * FROM assets WHERE asset_code = ?', [asset_code]);
    if (assets.length === 0) {
      return res.json({ success: false, message: '资产不存在' });
    }
    
    await run('UPDATE assets SET quantity = quantity + ?, updated_at = CURRENT_TIMESTAMP WHERE asset_code = ?', [quantity, asset_code]);
    
    await run(
      'INSERT INTO inventory (asset_code, quantity, type, operator, remark) VALUES (?, ?, ?, ?, ?)',
      [asset_code, quantity, 'in', operator || '', remark || '']
    );
    
    await run(
      'INSERT INTO ledger (asset_code, type, quantity, operator, related_no, remark) VALUES (?, ?, ?, ?, ?, ?)',
      [asset_code, '入库', quantity, operator || '', asset_code, remark || '']
    );
    
    res.json({ success: true, message: '入库成功' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/batch', async (req, res) => {
  try {
    const { items, operator } = req.body;
    
    for (const item of items) {
      const { name, model, brand, purchase_price, purchase_date, supplier, location, category_id, quantity } = item;
      const asset_code = 'AST' + Date.now().toString().slice(-8) + Math.random().toString(36).slice(-4);
      
      await run(
        'INSERT INTO assets (asset_code, name, model, brand, purchase_price, purchase_date, supplier, location, category_id, quantity, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)',
        [asset_code, name, model || '', brand || '', purchase_price || 0, purchase_date || '', supplier || '', location || '', category_id || 0, quantity || 1]
      );
      
      await run(
        'INSERT INTO inventory (asset_code, quantity, type, operator) VALUES (?, ?, ?, ?)',
        [asset_code, quantity || 1, 'in', operator || '']
      );
      
      await run(
        'INSERT INTO ledger (asset_code, type, quantity, operator, related_no) VALUES (?, ?, ?, ?, ?)',
        [asset_code, '入库', quantity || 1, operator || '', asset_code]
      );
    }
    
    res.json({ success: true, message: '批量入库成功' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;