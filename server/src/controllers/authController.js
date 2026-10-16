const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Validate strong password
const isStrongPassword = (password) => {
    const errors = [];
    if (password.length < 8) errors.push('Password must be at least 8 characters');
    if (!/[A-Z]/.test(password)) errors.push('Password must contain at least one uppercase letter');
    if (!/[a-z]/.test(password)) errors.push('Password must contain at least one lowercase letter');
    if (!/[0-9]/.test(password)) errors.push('Password must contain at least one digit');
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) errors.push('Password must contain at least one special character');
    return errors;
};

// POST /api/auth/register
exports.register = async (req, res) => {
    try {
        const { name, email, password, desiredBatch } = req.body;

        // Validate required fields
        if (!name || !email || !password || !desiredBatch) {
            return res.status(400).json({ message: 'All fields are required (name, email, password, desiredBatch)' });
        }

        // Validate email
        if (!isValidEmail(email)) {
            return res.status(400).json({ message: 'Please enter a valid email address' });
        }

        // Validate strong password
        const passwordErrors = isStrongPassword(password);
        if (passwordErrors.length > 0) {
            return res.status(400).json({ message: passwordErrors[0], errors: passwordErrors });
        }

        // Validate desiredBatch
        const validBatches = ['JEE Advanced', 'JEE Main', 'NEET', 'CET'];
        if (!validBatches.includes(desiredBatch)) {
            return res.status(400).json({ message: 'Invalid exam selection. Choose from: JEE Advanced, JEE Main, NEET, CET' });
        }

        // Check if email already exists
        const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

        const [result] = await pool.query(
            'INSERT INTO users (name, email, password, desired_batch, avatar_initials, display_name, target_exam) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, desiredBatch, initials, name, desiredBatch]
        );

        // Generate JWT
        const token = jwt.sign(
            { id: result.insertId, email, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.status(201).json({
            token,
            user: {
                id: result.insertId,
                name,
                email,
                desiredBatch,
                role: 'student',
                avatar: initials,
                displayName: name,
                phone: '',
                location: '',
                targetExam: desiredBatch
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/auth/login
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: 'student' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                desiredBatch: user.desired_batch,
                role: 'student',
                avatar: user.avatar_initials,
                displayName: user.display_name || user.name,
                phone: user.phone || '',
                location: user.location || '',
                targetExam: user.target_exam || user.desired_batch
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/auth/admin/login
exports.adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const [admins] = await pool.query('SELECT * FROM admins WHERE email = ?', [email]);
        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid admin credentials' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            token,
            admin: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role
            }
        });
    } catch (err) {
        console.error('Admin login error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/auth/me
exports.getMe = async (req, res) => {
    try {
        if (req.user.role === 'admin') {
            const [admins] = await pool.query('SELECT id, name, email, role FROM admins WHERE id = ?', [req.user.id]);
            if (admins.length === 0) return res.status(404).json({ message: 'Admin not found' });
            return res.json({ user: admins[0] });
        }

        const [users] = await pool.query(
            'SELECT id, name, email, desired_batch, avatar_initials, phone, location, display_name, target_exam, streak, tests_taken, created_at FROM users WHERE id = ?',
            [req.user.id]
        );
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = users[0];
        res.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                desiredBatch: user.desired_batch,
                avatar: user.avatar_initials,
                phone: user.phone,
                location: user.location,
                displayName: user.display_name,
                targetExam: user.target_exam,
                streak: user.streak,
                testsTaken: user.tests_taken,
                createdAt: user.created_at,
                role: 'student'
            }
        });
    } catch (err) {
        console.error('GetMe error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
