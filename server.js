const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const Database = require('better-sqlite3');

const db = new Database('./data.db');
const app = express();
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

// init db
db.prepare(`CREATE TABLE IF NOT EXISTS donors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT, email TEXT, phone TEXT, blood_type TEXT, city TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`).run();

db.prepare(`CREATE TABLE IF NOT EXISTS requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT, blood_type TEXT, city TEXT, phone TEXT, units INTEGER, created_at TEXT DEFAULT CURRENT_TIMESTAMP
)`).run();

// serve index
app.get('/', (req,res) => res.sendFile(path.join(__dirname, 'index.html')));

// API
app.get('/api/donors', (req,res) => {
  const rows = db.prepare('SELECT id,name,phone,blood_type,city,created_at FROM donors ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});
app.post('/api/donors', (req,res) => {
  const {name,email,phone,blood_type,city} = req.body;
  if(!name || !phone || !blood_type) return res.status(400).json({error:'بيانات ناقصة'});
  const info = db.prepare('INSERT INTO donors (name,email,phone,blood_type,city) VALUES (?,?,?,?,?)').run(name,email,phone,blood_type,city);
  res.json({id: info.lastInsertRowid});
});

app.get('/api/requests', (req,res) => {
  const rows = db.prepare('SELECT id,title,blood_type,city,phone,units,created_at FROM requests ORDER BY created_at DESC LIMIT 100').all();
  res.json(rows);
});
app.post('/api/requests', (req,res) => {
  const {title,blood_type,city,phone,units} = req.body;
  if(!title || !blood_type) return res.status(400).json({error:'بيانات ناقصة'});
  const info = db.prepare('INSERT INTO requests (title,blood_type,city,phone,units) VALUES (?,?,?,?,?)').run(title,blood_type,city,phone,units||1);
  res.json({id: info.lastInsertRowid});
});

// start
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
