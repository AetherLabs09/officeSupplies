const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const assetCategoryRoutes = require('./routes/assetCategory');
const assetRoutes = require('./routes/asset');
const inventoryRoutes = require('./routes/inventory');
const applyRoutes = require('./routes/apply');
const approvalRoutes = require('./routes/approval');
const ledgerRoutes = require('./routes/ledger');

app.use('/api/category', assetCategoryRoutes);
app.use('/api/asset', assetRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/apply', applyRoutes);
app.use('/api/approval', approvalRoutes);
app.use('/api/ledger', ledgerRoutes);

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});

db.initDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database initialization failed:', err);
});