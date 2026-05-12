const express = require('express');
const router = express.Router();
const { query, run } = require('../database/db');

router.get('/', async (req, res) => {
  try {
    const { apply_id = '' } = req.query;
    let sql = 'SELECT ap.*, u.name as approver_name FROM approval ap LEFT JOIN users u ON ap.approver_id = u.id WHERE 1=1';
    const params = [];
    
    if (apply_id) {
      sql += ' AND ap.apply_id = ?';
      params.push(apply_id);
    }
    
    sql += ' ORDER BY ap.level';
    
    const approvals = await query(sql, params);
    res.json({ success: true, data: approvals });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

router.post('/approve', async (req, res) => {
  try {
    const { apply_id, approver_id, level, status, remark } = req.body;
    
    const applies = await query('SELECT * FROM apply WHERE id = ?', [apply_id]);
    if (applies.length === 0) {
      return res.json({ success: false, message: '申请不存在' });
    }
    
    const apply = applies[0];
    
    await run(
      'UPDATE approval SET status = ?, remark = ?, approved_at = CURRENT_TIMESTAMP WHERE apply_id = ? AND level = ?',
      [status, remark || '', apply_id, level]
    );
    
    if (status === 'approved') {
      const nextLevel = level + 1;
      const hasNextApprover = await query('SELECT * FROM users WHERE role = ? AND id != ?', ['admin', approver_id]);
      
      if (hasNextApprover.length > 0 && nextLevel <= 3) {
        await run(
          'INSERT INTO approval (apply_id, approver_id, level, status) VALUES (?, ?, ?, ?)',
          [apply_id, hasNextApprover[0].id, nextLevel, 'pending']
        );
      } else {
        await run('UPDATE apply SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['approved', apply_id]);
        
        await run('UPDATE assets SET quantity = quantity - ?, status = ?, updated_at = CURRENT_TIMESTAMP WHERE asset_code = ?', [apply.quantity, 'used', apply.asset_code]);
        
        await run(
          'INSERT INTO ledger (asset_code, type, quantity, operator, related_no, remark) VALUES (?, ?, ?, ?, ?, ?)',
          [apply.asset_code, '领用', apply.quantity, 'system', apply.apply_no, '领用成功']
        );
      }
    } else if (status === 'rejected') {
      await run('UPDATE apply SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['rejected', apply_id]);
    }
    
    res.json({ success: true, message: '审批完成' });
  } catch (err) {
    res.json({ success: false, message: err.message });
  }
});

module.exports = router;