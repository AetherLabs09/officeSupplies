const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../../db/asset_management.db');
let db = null;

const initDatabase = async () => {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    const dbDir = path.dirname(dbPath);
    
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        reject(err);
      } else {
        createTables(resolve, reject);
      }
    });
  });
};

const createTables = (resolve, reject) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS asset_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      parent_id INTEGER DEFAULT 0,
      type TEXT DEFAULT 'office',
      description TEXT,
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      model TEXT,
      brand TEXT,
      purchase_price REAL,
      purchase_date TEXT,
      supplier TEXT,
      location TEXT,
      status TEXT DEFAULT 'in_stock',
      category_id INTEGER,
      quantity INTEGER DEFAULT 1,
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES asset_categories(id)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_code TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      type TEXT NOT NULL,
      operator TEXT,
      remark TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_code) REFERENCES assets(asset_code)
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT,
      department TEXT,
      role TEXT DEFAULT 'employee',
      status INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS apply (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apply_no TEXT UNIQUE NOT NULL,
      user_id INTEGER,
      asset_code TEXT,
      quantity INTEGER NOT NULL,
      purpose TEXT,
      apply_time TEXT,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (asset_code) REFERENCES assets(asset_code)
    );

    CREATE TABLE IF NOT EXISTS approval (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      apply_id INTEGER,
      approver_id INTEGER,
      level INTEGER DEFAULT 1,
      status TEXT DEFAULT 'pending',
      remark TEXT,
      approved_at TEXT,
      FOREIGN KEY (apply_id) REFERENCES apply(id),
      FOREIGN KEY (approver_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      asset_code TEXT NOT NULL,
      type TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      operator TEXT,
      related_no TEXT,
      remark TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (asset_code) REFERENCES assets(asset_code)
    );

    INSERT OR IGNORE INTO users (username, password, name, department, role) VALUES ('admin', '123456', '管理员', '行政部', 'admin');
    INSERT OR IGNORE INTO users (username, password, name, department, role) VALUES ('user', '123456', '普通用户', '技术部', 'employee');

    INSERT OR IGNORE INTO asset_categories (name, type, description) VALUES ('办公用品', 'office', '日常办公使用物品');
    INSERT OR IGNORE INTO asset_categories (name, type, description) VALUES ('固定资产', 'fixed', '价值较高、使用年限较长的资产');
    INSERT OR IGNORE INTO asset_categories (name, type, description) VALUES ('低值易耗品', 'consumable', '价值较低、消耗较快的物品');
    INSERT OR IGNORE INTO asset_categories (name, parent_id, type, description) VALUES ('文具', 1, 'office', '笔、本、文件夹等');
    INSERT OR IGNORE INTO asset_categories (name, parent_id, type, description) VALUES ('办公设备', 2, 'fixed', '电脑、打印机等');
  `;

  db.exec(sql, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
};

const query = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
      } else {
        resolve(rows);
      }
    });
  });
};

const run = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
      } else {
        resolve({ lastID: this.lastID, changes: this.changes });
      }
    });
  });
};

module.exports = {
  initDatabase,
  query,
  run,
  db
};