const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

// Konfigurasi koneksi MySQL
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // Ganti dengan user MySQL Anda
    password: '', // Ganti dengan password MySQL Anda
    database: 'inventaris_lab' // Ganti dengan nama database Anda
});

// Menghubungkan ke database
db.connect(err => {
    if (err) {
        console.error('Gagal terhubung ke database:', err);
        return;
    }
    console.log('Terhubung ke database MySQL.');
});

// Middleware
app.use(cors());
app.use(express.json());

// --- API Endpoints ---

// Endpoint untuk Alat
// --------------------

// GET semua alat
app.get('/api/alat', (req, res) => {
    const sql = 'SELECT * FROM alat';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error saat mengambil data alat:', err);
            return res.status(500).json({ error: 'Gagal mengambil data alat' });
        }
        res.json(result);
    });
});

// POST alat baru
app.post('/api/alat', (req, res) => {
    const newAlat = req.body;
    const sql = 'INSERT INTO alat SET ?';
    db.query(sql, newAlat, (err, result) => {
        if (err) {
            console.error('Error saat menambahkan alat:', err);
            return res.status(500).json({ error: 'Gagal menambahkan alat' });
        }
        res.status(201).json({ id: result.insertId, ...newAlat });
    });
});

// PUT (Update) alat
app.put('/api/alat/:id', (req, res) => {
    const { id } = req.params;
    const updatedAlat = req.body;
    const sql = 'UPDATE alat SET ? WHERE id = ?';
    db.query(sql, [updatedAlat, id], (err, result) => {
        if (err) {
            console.error('Error saat mengupdate alat:', err);
            return res.status(500).json({ error: 'Gagal mengupdate alat' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan' });
        }
        res.json({ message: 'Alat berhasil diupdate', affectedRows: result.affectedRows });
    });
});

// DELETE alat
app.delete('/api/alat/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM alat WHERE id = ?';
    db.query(sql, id, (err, result) => {
        if (err) {
            console.error('Error saat menghapus alat:', err);
            return res.status(500).json({ error: 'Gagal menghapus alat' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Alat tidak ditemukan' });
        }
        res.json({ message: 'Alat berhasil dihapus', affectedRows: result.affectedRows });
    });
});

// Endpoint untuk Bahan
// --------------------

// GET semua bahan
app.get('/api/bahan', (req, res) => {
    const sql = 'SELECT * FROM bahan';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error saat mengambil data bahan:', err);
            return res.status(500).json({ error: 'Gagal mengambil data bahan' });
        }
        res.json(result);
    });
});

// POST bahan baru
app.post('/api/bahan', (req, res) => {
    const newBahan = req.body;
    const sql = 'INSERT INTO bahan SET ?';
    db.query(sql, newBahan, (err, result) => {
        if (err) {
            console.error('Error saat menambahkan bahan:', err);
            return res.status(500).json({ error: 'Gagal menambahkan bahan' });
        }
        res.status(201).json({ id: result.insertId, ...newBahan });
    });
});

// PUT (Update) bahan
app.put('/api/bahan/:id', (req, res) => {
    const { id } = req.params;
    const updatedBahan = req.body;
    const sql = 'UPDATE bahan SET ? WHERE id = ?';
    db.query(sql, [updatedBahan, id], (err, result) => {
        if (err) {
            console.error('Error saat mengupdate bahan:', err);
            return res.status(500).json({ error: 'Gagal mengupdate bahan' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bahan tidak ditemukan' });
        }
        res.json({ message: 'Bahan berhasil diupdate', affectedRows: result.affectedRows });
    });
});

// DELETE bahan
app.delete('/api/bahan/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM bahan WHERE id = ?';
    db.query(sql, id, (err, result) => {
        if (err) {
            console.error('Error saat menghapus bahan:', err);
            return res.status(500).json({ error: 'Gagal menghapus bahan' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Bahan tidak ditemukan' });
        }
        res.json({ message: 'Bahan berhasil dihapus', affectedRows: result.affectedRows });
    });
});

// Endpoint untuk Peminjaman
// -------------------------

// GET semua peminjaman
app.get('/api/peminjaman', (req, res) => {
    const sql = 'SELECT * FROM peminjaman';
    db.query(sql, (err, result) => {
        if (err) {
            console.error('Error saat mengambil data peminjaman:', err);
            return res.status(500).json({ error: 'Gagal mengambil data peminjaman' });
        }
        res.json(result);
    });
});

// POST peminjaman baru
app.post('/api/peminjaman', (req, res) => {
    const newPeminjaman = req.body;
    const sql = 'INSERT INTO peminjaman SET ?';
    db.query(sql, newPeminjaman, (err, result) => {
        if (err) {
            console.error('Error saat menambahkan peminjaman:', err);
            return res.status(500).json({ error: 'Gagal menambahkan peminjaman' });
        }
        res.status(201).json({ id: result.insertId, ...newPeminjaman });
    });
});

// PUT (Update) tanggal kembali peminjaman
app.put('/api/peminjaman/:id', (req, res) => {
    const { id } = req.params;
    const { tanggalKembali } = req.body;
    const sql = 'UPDATE peminjaman SET tanggalKembali = ? WHERE id = ?';
    db.query(sql, [tanggalKembali, id], (err, result) => {
        if (err) {
            console.error('Error saat mengupdate peminjaman:', err);
            return res.status(500).json({ error: 'Gagal mengupdate peminjaman' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
        }
        res.json({ message: 'Peminjaman berhasil diupdate', affectedRows: result.affectedRows });
    });
});

// DELETE peminjaman
app.delete('/api/peminjaman/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'DELETE FROM peminjaman WHERE id = ?';
    db.query(sql, id, (err, result) => {
        if (err) {
            console.error('Error saat menghapus peminjaman:', err);
            return res.status(500).json({ error: 'Gagal menghapus peminjaman' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Peminjaman tidak ditemukan' });
        }
        res.json({ message: 'Peminjaman berhasil dihapus', affectedRows: result.affectedRows });
    });
});

// Jalankan server
app.listen(port, () => {
    console.log(`Backend server berjalan di http://localhost:${port}`);
});