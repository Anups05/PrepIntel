const { pool } = require('../config/db');
const bcrypt = require('bcryptjs');

// Validate Indian phone number: 10 digits, starts with 6-9, optional +91 prefix
const isValidIndianPhone = (phone) => {
    if (!phone || phone.trim() === '') return true; // optional field
    const cleaned = phone.replace(/[\s\-()]/g, '');
    return /^(\+91)?[6-9]\d{9}$/.test(cleaned);
};

// GET /api/students/stats/batches — Admin: get student counts per batch
exports.getBatchStats = async (req, res) => {
    try {
        const [totalResult] = await pool.query('SELECT COUNT(*) as total FROM users WHERE role = ?', ['student']);
        const [batchCounts] = await pool.query(
            'SELECT desired_batch as batch, COUNT(*) as count FROM users WHERE role = ? GROUP BY desired_batch',
            ['student']
        );
        res.json({
            totalStudents: totalResult[0].total,
            batches: batchCounts
        });
    } catch (err) {
        console.error('GetBatchStats error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/students/batch/:batchName — Admin: get all students in a specific batch
exports.getStudentsByBatch = async (req, res) => {
    try {
        const { batchName } = req.params;
        const [students] = await pool.query(
            'SELECT id, name, email, desired_batch, avatar_initials, phone, location, display_name, target_exam, created_at FROM users WHERE role = ? AND desired_batch = ? ORDER BY created_at DESC',
            ['student', batchName]
        );
        const formatted = students.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            batch: s.desired_batch,
            avatar: s.avatar_initials,
            phone: s.phone,
            location: s.location,
            displayName: s.display_name,
            targetExam: s.target_exam,
            createdAt: s.created_at
        }));
        res.json({ students: formatted, total: formatted.length });
    } catch (err) {
        console.error('GetStudentsByBatch error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/students — Admin: get all students with optional filters
exports.getAllStudents = async (req, res) => {
    try {
        const { search, batch } = req.query;

        let query = 'SELECT id, name, email, desired_batch, avatar_initials, phone, location, display_name, target_exam, streak, tests_taken, created_at FROM users WHERE role = ?';
        const params = ['student'];

        if (search) {
            query += ' AND (name LIKE ? OR email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        if (batch && batch !== 'all') {
            query += ' AND desired_batch = ?';
            params.push(batch);
        }

        query += ' ORDER BY created_at DESC';

        const [students] = await pool.query(query, params);

        const formattedStudents = students.map(s => ({
            id: s.id,
            name: s.name,
            email: s.email,
            batch: s.desired_batch,
            avatar: s.avatar_initials,
            phone: s.phone,
            location: s.location,
            displayName: s.display_name,
            targetExam: s.target_exam,
            streak: s.streak,
            testsTaken: s.tests_taken,
            createdAt: s.created_at
        }));

        res.json({ students: formattedStudents, total: formattedStudents.length });
    } catch (err) {
        console.error('GetAllStudents error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/students/:id — Admin: delete a single student
exports.deleteStudent = async (req, res) => {
    try {
        const { id } = req.params;

        const [existing] = await pool.query('SELECT id FROM users WHERE id = ? AND role = ?', [id, 'student']);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        await pool.query('DELETE FROM users WHERE id = ?', [id]);
        res.json({ message: 'Student deleted successfully' });
    } catch (err) {
        console.error('DeleteStudent error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// DELETE /api/students/bulk — Admin: delete multiple students
exports.deleteBulkStudents = async (req, res) => {
    try {
        const { ids } = req.body;

        if (!ids || !Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ message: 'Please provide an array of student IDs to delete' });
        }

        const placeholders = ids.map(() => '?').join(',');
        await pool.query(`DELETE FROM users WHERE id IN (${placeholders}) AND role = 'student'`, ids);

        res.json({ message: `${ids.length} student(s) deleted successfully` });
    } catch (err) {
        console.error('BulkDelete error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/students/me/profile — Student: update own profile (NOT email)
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, phone, location, displayName, targetExam } = req.body;

        // Validate Indian phone number if provided
        if (phone !== undefined && phone.trim() !== '' && !isValidIndianPhone(phone)) {
            return res.status(400).json({ message: 'Please enter a valid Indian phone number (10 digits starting with 6-9)' });
        }

        // Build dynamic update
        const updates = [];
        const params = [];

        if (name !== undefined) { updates.push('name = ?'); params.push(name); }
        if (phone !== undefined) { updates.push('phone = ?'); params.push(phone); }
        if (location !== undefined) { updates.push('location = ?'); params.push(location); }
        if (displayName !== undefined) { updates.push('display_name = ?'); params.push(displayName); }
        if (targetExam !== undefined) {
            updates.push('target_exam = ?');
            params.push(targetExam);
            // Also update desired_batch if it's a valid batch
            const validBatches = ['JEE Advanced', 'JEE Main', 'NEET', 'CET'];
            if (validBatches.includes(targetExam)) {
                updates.push('desired_batch = ?');
                params.push(targetExam);
            }
        }

        // Also update avatar_initials if name changes
        if (name) {
            const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
            updates.push('avatar_initials = ?');
            params.push(initials);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields to update' });
        }

        params.push(userId);
        await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, params);

        // Fetch updated user
        const [users] = await pool.query(
            'SELECT id, name, email, desired_batch, avatar_initials, phone, location, display_name, target_exam FROM users WHERE id = ?',
            [userId]
        );

        const user = users[0];
        res.json({
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                desiredBatch: user.desired_batch,
                avatar: user.avatar_initials,
                phone: user.phone,
                location: user.location,
                displayName: user.display_name,
                targetExam: user.target_exam
            }
        });
    } catch (err) {
        console.error('UpdateProfile error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/students/me/password — Student: change password
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        // Get current user
        const [users] = await pool.query('SELECT password FROM users WHERE id = ?', [userId]);
        if (users.length === 0) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Verify current password
        const isMatch = await bcrypt.compare(currentPassword, users[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        // Validate new password strength
        const errors = [];
        if (newPassword.length < 8) errors.push('Password must be at least 8 characters');
        if (!/[A-Z]/.test(newPassword)) errors.push('Password must contain at least one uppercase letter');
        if (!/[a-z]/.test(newPassword)) errors.push('Password must contain at least one lowercase letter');
        if (!/[0-9]/.test(newPassword)) errors.push('Password must contain at least one digit');
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) errors.push('Password must contain at least one special character');

        if (errors.length > 0) {
            return res.status(400).json({ message: errors[0], errors });
        }

        // Hash and update
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, userId]);

        res.json({ message: 'Password changed successfully' });
    } catch (err) {
        console.error('ChangePassword error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
