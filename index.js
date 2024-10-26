
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

const pool = new Pool(); // Configure your PostgreSQL connection

// Middleware to verify JWT
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
};

// Register user
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query(
            'INSERT INTO users (username, password_hash) VALUES ($1, $2)',
            [username, hashedPassword]
        );
        res.sendStatus(201);
    } catch (err) {
        res.status(400).send('Username already exists');
    }
});

// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await pool.query('SELECT * FROM users WHERE username = $1', [username]);

    if (user.rows.length === 0) return res.status(400).send('Invalid credentials');
    const match = await bcrypt.compare(password, user.rows[0].password_hash);

    if (match) {
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
        res.json({ token });
    } else {
        res.status(400).send('Invalid credentials');
    }
});

// CRUD for Tasks with authorization
app.get('/tasks', authenticateToken, async (req, res) => {
    const tasks = await pool.query('SELECT * FROM tasks WHERE user_id = $1', [req.user.id]);
    res.json(tasks.rows);
});

app.post('/tasks', authenticateToken, async (req, res) => {
    const { title, parent_id } = req.body;
    await pool.query(
        'INSERT INTO tasks (title, parent_id, user_id) VALUES ($1, $2, $3)',
        [title, parent_id, req.user.id]
    );
    res.sendStatus(201);
});

app.put('/tasks/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body;
    const result = await pool.query(
        'UPDATE tasks SET completed = $1 WHERE id = $2 AND user_id = $3',
        [completed, id, req.user.id]
    );
    if (result.rowCount === 0) return res.status(404).send('Task not found');
    res.sendStatus(204);
});

app.delete('/tasks/:id', authenticateToken, async (req, res) => {
    const result = await pool.query('DELETE FROM tasks WHERE id = $1 AND user_id = $2', [
        req.params.id,
        req.user.id,
    ]);
    if (result.rowCount === 0) return res.status(404).send('Task not found');
    res.sendStatus(204);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
