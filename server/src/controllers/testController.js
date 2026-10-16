const { pool } = require('../config/db');

// Calculate marks based on batch
const calculateMarks = (totalQuestions, assignedBatches) => {
    const batchStr = (Array.isArray(assignedBatches) ? assignedBatches.join(', ') : (assignedBatches || '')).toUpperCase();
    // CET = questions × 2, everything else = questions × 4
    if (batchStr === 'CET') {
        return totalQuestions * 2;
    }
    return totalQuestions * 4;
};

// POST /api/tests — Admin: create a new test with questions
exports.createTest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { title, testType, testDate, duration, assignedBatches, instructions, questions } = req.body;

        if (!title || !testType || !testDate || !duration) {
            return res.status(400).json({ message: 'Title, test type, date, and duration are required' });
        }

        if (!questions || !Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({ message: 'At least one question is required' });
        }

        const totalQuestions = questions.length;
        const batchesStr = Array.isArray(assignedBatches) ? assignedBatches.join(', ') : (assignedBatches || '');
        const totalMarks = calculateMarks(totalQuestions, batchesStr);

        // Insert test
        const [testResult] = await connection.query(
            `INSERT INTO tests (title, test_type, test_date, duration, total_questions, total_marks, assigned_batches, instructions, created_by)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [title, testType, testDate, duration, totalQuestions, totalMarks, batchesStr, instructions || '', req.user?.id || null]
        );

        const testId = testResult.insertId;

        // Insert questions
        const questionValues = questions.map(q => [
            testId,
            q.question || '',
            q.optionA || '',
            q.optionB || '',
            q.optionC || '',
            q.optionD || '',
            (q.answer || 'A').toUpperCase().charAt(0),
            q.difficulty || 'Medium',
            q.subject || '',
            q.topic || ''
        ]);

        await connection.query(
            `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, answer, difficulty, subject, topic)
             VALUES ?`,
            [questionValues]
        );

        await connection.commit();

        res.status(201).json({
            message: 'Test created successfully',
            test: {
                id: testId,
                title,
                testType,
                testDate,
                duration,
                totalQuestions,
                totalMarks,
                assignedBatches: batchesStr,
                status: 'Scheduled'
            }
        });
    } catch (err) {
        await connection.rollback();
        console.error('CreateTest error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        connection.release();
    }
};

// GET /api/tests — Admin: get all tests
exports.getAllTests = async (req, res) => {
    try {
        const [tests] = await pool.query(
            'SELECT * FROM tests ORDER BY created_at DESC'
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatted = tests.map(t => {
            const testDate = new Date(t.test_date);
            testDate.setHours(0, 0, 0, 0);
            let status;
            if (testDate.getTime() < today.getTime()) {
                status = 'Completed';
            } else if (testDate.getTime() === today.getTime()) {
                status = 'Active';
            } else {
                status = 'Scheduled';
            }

            return {
                id: t.id,
                title: t.title,
                type: t.test_type,
                date: t.test_date,
                duration: t.duration,
                questions: t.total_questions,
                totalMarks: t.total_marks,
                assignedTo: t.assigned_batches,
                instructions: t.instructions,
                status,
                createdAt: t.created_at
            };
        });
        res.json({ tests: formatted });
    } catch (err) {
        console.error('GetAllTests error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/:id — Admin: get a single test with all its questions
exports.getTestById = async (req, res) => {
    try {
        const { id } = req.params;
        const [tests] = await pool.query('SELECT * FROM tests WHERE id = ?', [id]);
        if (tests.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        const t = tests[0];

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const testDate = new Date(t.test_date);
        testDate.setHours(0, 0, 0, 0);
        let status;
        if (testDate.getTime() < today.getTime()) status = 'Completed';
        else if (testDate.getTime() === today.getTime()) status = 'Active';
        else status = 'Scheduled';

        const [questions] = await pool.query(
            'SELECT * FROM questions WHERE test_id = ? ORDER BY id ASC',
            [id]
        );

        const formattedQuestions = questions.map(q => ({
            id: q.id,
            question: q.question_text,
            optionA: q.option_a,
            optionB: q.option_b,
            optionC: q.option_c,
            optionD: q.option_d,
            answer: q.answer,
            difficulty: q.difficulty,
            subject: q.subject,
            topic: q.topic
        }));

        res.json({
            test: {
                id: t.id,
                title: t.title,
                type: t.test_type,
                date: t.test_date,
                duration: t.duration,
                questions: t.total_questions,
                totalMarks: t.total_marks,
                assignedTo: t.assigned_batches,
                instructions: t.instructions,
                status,
                createdAt: t.created_at
            },
            questionsList: formattedQuestions
        });
    } catch (err) {
        console.error('GetTestById error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// PUT /api/tests/:id — Admin: update a scheduled test
exports.updateTest = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { title, testType, testDate, duration, assignedBatches, instructions, questions } = req.body;

        // Check test exists and is scheduled (future date)
        const [existing] = await connection.query('SELECT * FROM tests WHERE id = ?', [id]);
        if (existing.length === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const existingDate = new Date(existing[0].test_date);
        existingDate.setHours(0, 0, 0, 0);
        if (existingDate.getTime() <= today.getTime()) {
            return res.status(400).json({ message: 'Cannot edit active or completed tests' });
        }

        const totalQuestions = questions ? questions.length : existing[0].total_questions;
        const batchesStr = assignedBatches
            ? (Array.isArray(assignedBatches) ? assignedBatches.join(', ') : assignedBatches)
            : existing[0].assigned_batches;
        const totalMarks = calculateMarks(totalQuestions, batchesStr);

        // Update test metadata
        await connection.query(
            `UPDATE tests SET title = ?, test_type = ?, test_date = ?, duration = ?, total_questions = ?, total_marks = ?, assigned_batches = ?, instructions = ? WHERE id = ?`,
            [
                title || existing[0].title,
                testType || existing[0].test_type,
                testDate || existing[0].test_date,
                duration || existing[0].duration,
                totalQuestions,
                totalMarks,
                batchesStr,
                instructions !== undefined ? instructions : existing[0].instructions,
                id
            ]
        );

        // Replace questions if provided
        if (questions && Array.isArray(questions) && questions.length > 0) {
            await connection.query('DELETE FROM questions WHERE test_id = ?', [id]);
            const questionValues = questions.map(q => [
                id,
                q.question || '',
                q.optionA || '',
                q.optionB || '',
                q.optionC || '',
                q.optionD || '',
                (q.answer || 'A').toUpperCase().charAt(0),
                q.difficulty || 'Medium',
                q.subject || '',
                q.topic || ''
            ]);
            await connection.query(
                `INSERT INTO questions (test_id, question_text, option_a, option_b, option_c, option_d, answer, difficulty, subject, topic) VALUES ?`,
                [questionValues]
            );
        }

        await connection.commit();
        res.json({ message: 'Test updated successfully' });
    } catch (err) {
        await connection.rollback();
        console.error('UpdateTest error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        connection.release();
    }
};

// DELETE /api/tests/:id — Admin: delete a test (cascades to questions)
exports.deleteTest = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await pool.query('DELETE FROM tests WHERE id = ?', [id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Test not found' });
        }
        res.json({ message: 'Test deleted successfully' });
    } catch (err) {
        console.error('DeleteTest error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/stats/overview — Admin: get test stats + sync statuses in DB
exports.getTestStats = async (req, res) => {
    try {
        // Update statuses in database so they persist
        await pool.query(
            "UPDATE tests SET status = 'Completed' WHERE test_date < CURDATE() AND status != 'Completed'"
        );
        await pool.query(
            "UPDATE tests SET status = 'Active' WHERE test_date = CURDATE() AND status != 'Active'"
        );
        await pool.query(
            "UPDATE tests SET status = 'Scheduled' WHERE test_date > CURDATE() AND status != 'Scheduled'"
        );

        const [completedResult] = await pool.query(
            "SELECT COUNT(*) as count FROM tests WHERE status = 'Completed'"
        );
        const [totalResult] = await pool.query(
            "SELECT COUNT(*) as count FROM tests"
        );

        res.json({
            completedTests: completedResult[0].count,
            totalTests: totalResult[0].count
        });
    } catch (err) {
        console.error('GetTestStats error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/admin/analytics — Admin: comprehensive platform analytics
exports.getAdminAnalytics = async (req, res) => {
    try {
        const period = req.query.period || '6months'; // weekly, monthly, 6months, yearly
        let dateFilter = '';
        let prevDateFilter = '';
        switch (period) {
            case 'weekly':
                dateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                prevDateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY)";
                break;
            case 'monthly':
                dateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
                prevDateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 2 MONTH) AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)";
                break;
            case '6months':
                dateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
                prevDateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH) AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 6 MONTH)";
                break;
            case 'yearly':
                dateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
                prevDateFilter = "AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 2 YEAR) AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 1 YEAR)";
                break;
        }

        // 1. Total students now vs previous period
        const [totalStudentsNow] = await pool.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'student'");
        const [totalStudentsLastMonth] = await pool.query("SELECT COUNT(*) as cnt FROM users WHERE role = 'student' AND created_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)");
        const totalStudents = totalStudentsNow[0].cnt;
        const prevStudents = totalStudentsLastMonth[0].cnt;
        const studentsTrend = prevStudents > 0 ? Math.round(((totalStudents - prevStudents) / prevStudents) * 100 * 10) / 10 : (totalStudents > 0 ? 100 : 0);

        // 2. Avg accuracy current period
        const [avgAccResult] = await pool.query(
            `SELECT AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                ELSE 0 END) as avgAccuracy
             FROM test_attempts ta WHERE 1=1 ${dateFilter}`
        );
        const avgAccuracy = Math.round((avgAccResult[0].avgAccuracy || 0) * 10) / 10;

        // Avg accuracy previous period
        const [prevAvgAccResult] = await pool.query(
            `SELECT AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                ELSE 0 END) as avgAccuracy
             FROM test_attempts ta WHERE 1=1 ${prevDateFilter}`
        );
        const prevAvgAccuracy = prevAvgAccResult[0].avgAccuracy ? Math.round(prevAvgAccResult[0].avgAccuracy * 10) / 10 : null;
        const accuracyTrend = prevAvgAccuracy !== null ? Math.round((avgAccuracy - prevAvgAccuracy) * 10) / 10 : null;

        // 3. Avg time per question
        const [avgTimeResult] = await pool.query("SELECT AVG(time_taken_seconds) as avgTime FROM question_responses WHERE is_attempted = 1");
        const avgTimePerQ = Math.round(avgTimeResult[0].avgTime || 0);
        const [prevAvgTimeResult] = await pool.query("SELECT AVG(time_taken_seconds) as avgTime FROM question_responses WHERE is_attempted = 1 AND responded_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)");
        const prevAvgTime = prevAvgTimeResult[0].avgTime ? Math.round(prevAvgTimeResult[0].avgTime) : null;
        const timeTrend = prevAvgTime !== null && prevAvgTime > 0 ? Math.round(((avgTimePerQ - prevAvgTime) / prevAvgTime) * 100 * 10) / 10 : null;

        // 4. Tests conducted
        const [testsNow] = await pool.query("SELECT COUNT(*) as cnt FROM tests WHERE status = 'Completed'");
        const [testsLastMonth] = await pool.query("SELECT COUNT(*) as cnt FROM tests WHERE status = 'Completed' AND test_date < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)");
        const totalTestsConducted = testsNow[0].cnt;
        const prevTests = testsLastMonth[0].cnt;
        const testsTrend = prevTests > 0 ? Math.round(((totalTestsConducted - prevTests) / prevTests) * 100 * 10) / 10 : (totalTestsConducted > 0 ? 100 : 0);

        // 5. Platform performance based on period filter
        let groupFormat, intervalStr;
        switch (period) {
            case 'weekly':
                groupFormat = '%Y-%m-%d'; intervalStr = '7 DAY'; break;
            case 'monthly':
                groupFormat = '%Y-%m-%d'; intervalStr = '1 MONTH'; break;
            case '6months':
                groupFormat = '%Y-%m'; intervalStr = '6 MONTH'; break;
            case 'yearly':
                groupFormat = '%Y-%m'; intervalStr = '1 YEAR'; break;
            default:
                groupFormat = '%Y-%m'; intervalStr = '6 MONTH'; break;
        }
        const [monthlyPerf] = await pool.query(
            `SELECT DATE_FORMAT(ta.attempted_at, '${groupFormat}') as period_key,
                    COUNT(DISTINCT ta.user_id) as activeStudents,
                    AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                        THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                        ELSE 0 END) as avgAccuracy
             FROM test_attempts ta
             WHERE ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL ${intervalStr})
             GROUP BY period_key ORDER BY period_key ASC`
        );
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const platformPerformance = monthlyPerf.map(m => {
            let label = m.period_key;
            if (groupFormat === '%Y-%m') {
                const [y, mo] = m.period_key.split('-');
                label = monthNames[parseInt(mo) - 1];
            } else {
                const d = new Date(m.period_key);
                label = `${d.getDate()}/${d.getMonth() + 1}`;
            }
            return {
                month: label,
                accuracy: Math.round(m.avgAccuracy || 0),
                students: m.activeStudents
            };
        });

        // 6. Subject-wise accuracy — ensure ALL subjects shown
        const allSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
        const [subjectAccuracy] = await pool.query(
            `SELECT subject,
                    SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
                    SUM(CASE WHEN is_attempted = 1 THEN 1 ELSE 0 END) as attempted
             FROM question_responses
             GROUP BY subject
             HAVING subject IS NOT NULL AND subject != ''`
        );
        const subjectMap = {};
        subjectAccuracy.forEach(s => { subjectMap[s.subject] = s; });
        const subjectColors = { 'Physics': '#EC4899', 'Chemistry': '#F59E0B', 'Mathematics': '#8B5CF6', 'Biology': '#10B981' };
        const subjectData = allSubjects.map(subj => {
            const s = subjectMap[subj];
            return {
                name: subj,
                accuracy: s && s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
                color: subjectColors[subj] || '#6B7280'
            };
        });

        // 7. Batch-wise accuracy — ensure ALL batches shown
        const allBatches = ['JEE Advanced', 'JEE Main', 'NEET', 'CET'];
        const [batchAccuracy] = await pool.query(
            `SELECT u.desired_batch as batch,
                    AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                        THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                        ELSE 0 END) as avgAccuracy
             FROM test_attempts ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.role = 'student' AND u.desired_batch IS NOT NULL AND u.desired_batch != ''
             GROUP BY u.desired_batch`
        );
        const batchMap = {};
        batchAccuracy.forEach(b => { batchMap[b.batch] = b; });
        const batchColors = { 'JEE Advanced': '#8B5CF6', 'JEE Main': '#F59E0B', 'NEET': '#10B981', 'CET': '#3B82F6' };
        const batchData = allBatches.map(batch => ({
            name: batch,
            accuracy: batchMap[batch] ? Math.round(batchMap[batch].avgAccuracy || 0) : 0,
            color: batchColors[batch] || '#6B7280'
        }));

        // 8. Weak topics — JOIN question_responses with questions to get topic
        const [weakTopicsRaw] = await pool.query(
            `SELECT q.topic, q.subject,
                    COUNT(DISTINCT qr.user_id) as studentsWrong,
                    SUM(CASE WHEN qr.is_attempted = 1 AND qr.is_correct = 0 THEN 1 ELSE 0 END) as incorrectCount,
                    SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as totalAttempts
             FROM question_responses qr
             JOIN questions q ON qr.question_id = q.id
             WHERE q.topic IS NOT NULL AND q.topic != '' AND qr.is_attempted = 1
             GROUP BY q.topic, q.subject
             HAVING totalAttempts >= 1
             ORDER BY (incorrectCount / totalAttempts) DESC
             LIMIT 10`
        );
        const weakTopics = weakTopicsRaw.map(t => ({
            topic: t.topic,
            subject: t.subject,
            errorRate: Math.round((t.incorrectCount / t.totalAttempts) * 100),
            students: t.studentsWrong
        }));

        // 9. Active students — distinct students who took at least 1 test in last 30 days
        const [activeStudentsResult] = await pool.query(
            `SELECT COUNT(DISTINCT ta.user_id) as cnt
             FROM test_attempts ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.role = 'student' AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
        );
        const activeStudents = activeStudentsResult[0].cnt;
        const [prevActiveResult] = await pool.query(
            `SELECT COUNT(DISTINCT ta.user_id) as cnt
             FROM test_attempts ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.role = 'student'
               AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
               AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)`
        );
        const prevActive = prevActiveResult[0].cnt;
        const activeStudentsTrend = prevActive > 0
            ? Math.round(((activeStudents - prevActive) / prevActive) * 100 * 10) / 10
            : (activeStudents > 0 ? 100 : 0);

        // 10. At-risk students — students whose overall avg accuracy < 40%
        const [atRiskResult] = await pool.query(
            `SELECT COUNT(*) as cnt FROM (
                SELECT ta.user_id,
                       AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                           THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                           ELSE 0 END) as avgAcc
                FROM test_attempts ta
                JOIN users u ON ta.user_id = u.id
                WHERE u.role = 'student'
                GROUP BY ta.user_id
                HAVING avgAcc < 40
            ) as at_risk`
        );
        const atRiskStudents = atRiskResult[0].cnt;

        // At-risk count from previous month (for trend)
        const [prevAtRiskResult] = await pool.query(
            `SELECT COUNT(*) as cnt FROM (
                SELECT ta.user_id,
                       AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                           THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                           ELSE 0 END) as avgAcc
                FROM test_attempts ta
                JOIN users u ON ta.user_id = u.id
                WHERE u.role = 'student'
                  AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)
                GROUP BY ta.user_id
                HAVING avgAcc < 40
            ) as prev_at_risk`
        );
        const prevAtRisk = prevAtRiskResult[0].cnt;
        const atRiskTrend = prevAtRisk > 0
            ? Math.round(((atRiskStudents - prevAtRisk) / prevAtRisk) * 100 * 10) / 10
            : (atRiskStudents > 0 ? 100 : 0);

        // 11. Top performer — student with highest avg accuracy
        const [topPerformerResult] = await pool.query(
            `SELECT u.name, u.streak, u.desired_batch as batch,
                    AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                        THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                        ELSE 0 END) as avgAccuracy
             FROM test_attempts ta
             JOIN users u ON ta.user_id = u.id
             WHERE u.role = 'student'
             GROUP BY ta.user_id
             ORDER BY avgAccuracy DESC
             LIMIT 1`
        );
        const topPerformer = topPerformerResult.length > 0 ? {
            name: topPerformerResult[0].name,
            accuracy: Math.round(topPerformerResult[0].avgAccuracy),
            streak: topPerformerResult[0].streak || 0,
            batch: topPerformerResult[0].batch || ''
        } : null;

        res.json({
            totalStudents, studentsTrend,
            avgAccuracy, accuracyTrend,
            avgTimePerQ, timeTrend,
            totalTestsConducted, testsTrend,
            platformPerformance, subjectData, batchData,
            weakTopics,
            activeStudents, activeStudentsTrend,
            atRiskStudents, atRiskTrend,
            topPerformer
        });
    } catch (err) {
        console.error('GetAdminAnalytics error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/admin/batch-analytics — Admin: analytics for all batches
exports.getBatchAnalytics = async (req, res) => {
    try {
        const allBatches = ['JEE Advanced', 'JEE Main', 'NEET', 'CET'];
        const result = [];

        for (const batchName of allBatches) {
            // Student count
            const [countRes] = await pool.query(
                "SELECT COUNT(*) as cnt FROM users WHERE role = 'student' AND desired_batch = ?", [batchName]
            );
            const studentCount = countRes[0].cnt;

            // Avg accuracy for this batch
            const [accRes] = await pool.query(
                `SELECT AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                    THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as avgAccuracy
                 FROM test_attempts ta JOIN users u ON ta.user_id = u.id
                 WHERE u.desired_batch = ?`, [batchName]
            );
            const avgAccuracy = Math.round((accRes[0].avgAccuracy || 0) * 10) / 10;

            // Previous month accuracy for trend
            const [prevAccRes] = await pool.query(
                `SELECT AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                    THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as avgAccuracy
                 FROM test_attempts ta JOIN users u ON ta.user_id = u.id
                 WHERE u.desired_batch = ? AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 1 MONTH)`, [batchName]
            );
            const prevAcc = prevAccRes[0].avgAccuracy ? Math.round(prevAccRes[0].avgAccuracy * 10) / 10 : null;
            const accTrend = prevAcc !== null ? Math.round((avgAccuracy - prevAcc) * 10) / 10 : null;

            // Engagement: only Completed/Active tests (not Scheduled)
            const [testsForBatch] = await pool.query(
                "SELECT id FROM tests WHERE (FIND_IN_SET(?, assigned_batches) OR assigned_batches = ?) AND status != 'Scheduled'",
                [batchName, batchName]
            );
            let engagement = 0;
            if (testsForBatch.length > 0 && studentCount > 0) {
                let totalPossible = testsForBatch.length * studentCount;
                const testIds = testsForBatch.map(t => t.id);
                const [attemptCount] = await pool.query(
                    `SELECT COUNT(*) as cnt FROM test_attempts ta JOIN users u ON ta.user_id = u.id
                     WHERE ta.test_id IN (?) AND u.desired_batch = ?`, [testIds, batchName]
                );
                engagement = Math.round((attemptCount[0].cnt / totalPossible) * 100);
            }

            // Strongest/weakest subject by majority of students
            const [subjectPerStudent] = await pool.query(
                `SELECT qr.user_id, qr.subject,
                        SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                        SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as attempted
                 FROM question_responses qr
                 JOIN users u ON qr.user_id = u.id
                 WHERE u.desired_batch = ? AND qr.subject IS NOT NULL AND qr.subject != ''
                 GROUP BY qr.user_id, qr.subject`, [batchName]
            );
            // For each student, find their strongest and weakest subject
            const studentSubjects = {};
            subjectPerStudent.forEach(row => {
                if (!studentSubjects[row.user_id]) studentSubjects[row.user_id] = [];
                const acc = row.attempted > 0 ? (row.correct / row.attempted) * 100 : 0;
                studentSubjects[row.user_id].push({ subject: row.subject, accuracy: acc });
            });
            const strongVotes = {}, weakVotes = {};
            Object.values(studentSubjects).forEach(subjects => {
                if (subjects.length === 0) return;
                subjects.sort((a, b) => b.accuracy - a.accuracy);
                const strong = subjects[0].subject;
                const weak = subjects[subjects.length - 1].subject;
                strongVotes[strong] = (strongVotes[strong] || 0) + 1;
                weakVotes[weak] = (weakVotes[weak] || 0) + 1;
            });
            const strongest = Object.entries(strongVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';
            const weakest = Object.entries(weakVotes).sort((a, b) => b[1] - a[1])[0]?.[0] || '—';

            result.push({
                name: batchName, students: studentCount,
                avgAccuracy, accTrend, engagement,
                strongest, weakest
            });
        }

        // Subject-wise comparison: avg accuracy per subject per batch
        const allSubjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology'];
        const subjectComparison = [];
        for (const subj of allSubjects) {
            const row = { subject: subj };
            for (const batchName of allBatches) {
                const key = batchName.replace(/\s+/g, '').toLowerCase(); // e.g. 'jeeadvanced'
                const [subjAcc] = await pool.query(
                    `SELECT SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                            SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as attempted
                     FROM question_responses qr JOIN users u ON qr.user_id = u.id
                     WHERE u.desired_batch = ? AND qr.subject = ?`, [batchName, subj]
                );
                const acc = subjAcc[0].attempted > 0 ? Math.round((subjAcc[0].correct / subjAcc[0].attempted) * 100) : 0;
                row[key] = acc;
            }
            subjectComparison.push(row);
        }

        // Progress trend: based on trendPeriod query param
        const trendPeriod = req.query.trendPeriod || 'weekly';
        let trendPoints, trendIntervalUnit;
        switch (trendPeriod) {
            case 'daily':
                trendPoints = 7; trendIntervalUnit = 'DAY'; break;
            case 'weekly':
                trendPoints = 6; trendIntervalUnit = 'WEEK'; break;
            case 'monthly':
                trendPoints = 6; trendIntervalUnit = 'MONTH'; break;
            case 'yearly':
                trendPoints = 4; trendIntervalUnit = 'YEAR'; break;
            default:
                trendPoints = 6; trendIntervalUnit = 'WEEK'; break;
        }
        const progressTrend = [];
        for (let p = trendPoints - 1; p >= 0; p--) {
            let label;
            let startDate, endDate;
            const now = new Date();
            if (trendIntervalUnit === 'DAY') {
                const d = new Date(now); d.setDate(d.getDate() - p);
                label = d.toLocaleDateString('en-US', { weekday: 'short' });
                startDate = new Date(d); startDate.setHours(0, 0, 0, 0);
                endDate = new Date(d); endDate.setDate(endDate.getDate() + 1); endDate.setHours(0, 0, 0, 0);
            } else if (trendIntervalUnit === 'WEEK') {
                label = `W${trendPoints - p}`;
                startDate = new Date(now); startDate.setDate(startDate.getDate() - (p + 1) * 7);
                endDate = new Date(now); endDate.setDate(endDate.getDate() - p * 7);
            } else if (trendIntervalUnit === 'MONTH') {
                const d = new Date(now); d.setMonth(d.getMonth() - p);
                label = d.toLocaleDateString('en-US', { month: 'short' });
                startDate = new Date(now); startDate.setMonth(startDate.getMonth() - (p + 1));
                endDate = new Date(now); endDate.setMonth(endDate.getMonth() - p);
            } else {
                const d = new Date(now); d.setFullYear(d.getFullYear() - p);
                label = d.getFullYear().toString();
                startDate = new Date(now); startDate.setFullYear(startDate.getFullYear() - (p + 1));
                endDate = new Date(now); endDate.setFullYear(endDate.getFullYear() - p);
            }
            const startStr = startDate.toISOString().split('T')[0];
            const endStr = endDate.toISOString().split('T')[0];

            const row = { label };
            for (const batchName of allBatches) {
                const key = batchName.replace(/\s+/g, '').toLowerCase();
                const [acc] = await pool.query(
                    `SELECT AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                        THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                        ELSE 0 END) as avgAccuracy
                     FROM test_attempts ta JOIN users u ON ta.user_id = u.id
                     WHERE u.desired_batch = ?
                       AND ta.attempted_at >= ?
                       AND ta.attempted_at < ?`,
                    [batchName, startStr, endStr]
                );
                row[key] = Math.round(acc[0].avgAccuracy || 0);
            }
            progressTrend.push(row);
        }

        res.json({ batches: result, subjectComparison, progressTrend });
    } catch (err) {
        console.error('GetBatchAnalytics error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/admin/batch-details/:batchName — Admin: detailed batch view (students + tests)
exports.getBatchDetails = async (req, res) => {
    try {
        const batchName = req.params.batchName;

        // Tab 1: Student details with individual stats
        const [students] = await pool.query(
            "SELECT id, name, email, created_at FROM users WHERE role = 'student' AND desired_batch = ? ORDER BY name ASC",
            [batchName]
        );
        const studentDetails = [];
        for (const s of students) {
            const [stats] = await pool.query(
                `SELECT AVG(score) as avgScore,
                        AVG(CASE WHEN (correct_count + incorrect_count) > 0
                            THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100)
                            ELSE 0 END) as avgAccuracy
                 FROM test_attempts WHERE user_id = ?`, [s.id]
            );
            const [timeStats] = await pool.query(
                "SELECT AVG(time_taken_seconds) as avgTime FROM question_responses WHERE user_id = ? AND is_attempted = 1", [s.id]
            );
            // Strongest/weakest subject for this student
            const [subjStats] = await pool.query(
                `SELECT subject,
                        SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
                        SUM(CASE WHEN is_attempted = 1 THEN 1 ELSE 0 END) as attempted
                 FROM question_responses WHERE user_id = ? AND subject IS NOT NULL AND subject != ''
                 GROUP BY subject`, [s.id]
            );
            const subjAccs = subjStats.map(ss => ({
                subject: ss.subject,
                accuracy: ss.attempted > 0 ? (ss.correct / ss.attempted) * 100 : 0
            }));
            subjAccs.sort((a, b) => b.accuracy - a.accuracy);

            studentDetails.push({
                id: s.id, name: s.name, email: s.email,
                joinedAt: s.created_at,
                avgScore: Math.round(stats[0].avgScore || 0),
                avgAccuracy: Math.round(stats[0].avgAccuracy || 0),
                avgTimePerQ: Math.round(timeStats[0].avgTime || 0),
                strongest: subjAccs.length > 0 ? subjAccs[0].subject : '—',
                weakest: subjAccs.length > 0 ? subjAccs[subjAccs.length - 1].subject : '—'
            });
        }

        // Tab 2: Tests for this batch with stats
        const totalStudentsInBatch = students.length;
        const [tests] = await pool.query(
            "SELECT id, title, test_type, test_date, total_questions, total_marks, status, created_at FROM tests WHERE (FIND_IN_SET(?, assigned_batches) OR assigned_batches = ?) AND status != 'Scheduled' ORDER BY test_date DESC",
            [batchName, batchName]
        );
        const testDetails = [];
        for (const t of tests) {
            // Only count attempts from students in this batch
            const [attemptStats] = await pool.query(
                `SELECT COUNT(*) as attemptCount,
                        AVG(ta.score) as avgScore,
                        AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                            THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                            ELSE 0 END) as avgAccuracy
                 FROM test_attempts ta JOIN users u ON ta.user_id = u.id
                 WHERE ta.test_id = ? AND u.desired_batch = ?`, [t.id, batchName]
            );
            testDetails.push({
                id: t.id, title: t.title, type: t.test_type,
                date: t.test_date, createdAt: t.created_at,
                totalQuestions: t.total_questions, totalMarks: t.total_marks,
                avgScore: Math.round(attemptStats[0].avgScore || 0),
                avgAccuracy: Math.round(attemptStats[0].avgAccuracy || 0),
                attempted: attemptStats[0].attemptCount,
                totalStudents: totalStudentsInBatch
            });
        }

        // Engagement score: sum of attempts / (total tests * total students)
        const totalAttempts = testDetails.reduce((sum, t) => sum + t.attempted, 0);
        const totalPossible = tests.length * totalStudentsInBatch;
        const engagementScore = totalPossible > 0 ? Math.round((totalAttempts / totalPossible) * 100 * 100) / 100 : 0;

        res.json({
            students: studentDetails,
            tests: testDetails,
            totalTests: tests.length,
            totalStudents: totalStudentsInBatch,
            engagementScore
        });
    } catch (err) {
        console.error('GetBatchDetails error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/questions/all — Admin: get all questions for the question bank
exports.getAllQuestions = async (req, res) => {
    try {
        const [questions] = await pool.query(
            `SELECT q.id, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.answer, q.difficulty, q.subject, q.topic, q.test_id, t.assigned_batches, t.title as test_title
             FROM questions q
             LEFT JOIN tests t ON q.test_id = t.id
             ORDER BY q.id DESC`
        );
        // Get per-question stats
        const [qStats] = await pool.query(
            `SELECT question_id,
                    SUM(CASE WHEN is_attempted = 1 THEN 1 ELSE 0 END) as totalAttempts,
                    SUM(CASE WHEN is_attempted = 1 AND is_correct = 0 THEN 1 ELSE 0 END) as incorrectCount,
                    AVG(CASE WHEN is_attempted = 1 AND time_taken_seconds > 0 THEN time_taken_seconds ELSE NULL END) as avgTime
             FROM question_responses
             GROUP BY question_id`
        );
        const statsMap = {};
        qStats.forEach(s => {
            statsMap[s.question_id] = {
                errorRate: s.totalAttempts > 0 ? Math.round((s.incorrectCount / s.totalAttempts) * 100) : null,
                avgTime: s.avgTime ? Math.round(s.avgTime) : null,
                totalAttempts: s.totalAttempts
            };
        });

        const formatted = questions.map(q => ({
            id: q.id,
            text: q.question_text,
            subject: q.subject || '',
            topic: q.topic || '',
            difficulty: q.difficulty || 'Medium',
            batch: q.assigned_batches || '',
            testTitle: q.test_title || '',
            testId: q.test_id,
            errorRate: statsMap[q.id]?.errorRate ?? null,
            avgTime: statsMap[q.id]?.avgTime ?? null,
            totalAttempts: statsMap[q.id]?.totalAttempts ?? 0
        }));
        res.json({ questions: formatted, total: formatted.length });
    } catch (err) {
        console.error('GetAllQuestions error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/questions/analytics — Admin: question bank analytics (most incorrect, time consuming, quick stats)
exports.getQuestionBankAnalytics = async (req, res) => {
    try {
        // Most Incorrect Questions: % of students who answered incorrectly
        const [mostIncorrect] = await pool.query(
            `SELECT qr.question_id, q.question_text, q.subject, q.topic,
                    COUNT(*) as totalAttempts,
                    SUM(CASE WHEN qr.is_correct = 0 AND qr.is_attempted = 1 THEN 1 ELSE 0 END) as incorrectCount
             FROM question_responses qr
             JOIN questions q ON qr.question_id = q.id
             WHERE qr.is_attempted = 1
             GROUP BY qr.question_id
             HAVING totalAttempts >= 1
             ORDER BY (incorrectCount / totalAttempts) DESC
             LIMIT 20`
        );
        const incorrectData = mostIncorrect.map(q => ({
            id: q.question_id,
            text: q.question_text,
            subject: q.subject || '—',
            topic: q.topic || '—',
            errorRate: Math.round((q.incorrectCount / q.totalAttempts) * 100),
            totalAttempts: q.totalAttempts,
            incorrectCount: q.incorrectCount
        }));

        // High Time-Consuming Questions: avg time across all students who attempted
        const [timeConsuming] = await pool.query(
            `SELECT qr.question_id, q.question_text, q.subject, q.topic,
                    AVG(qr.time_taken_seconds) as avgTime,
                    COUNT(*) as totalAttempts
             FROM question_responses qr
             JOIN questions q ON qr.question_id = q.id
             WHERE qr.is_attempted = 1 AND qr.time_taken_seconds > 0
             GROUP BY qr.question_id
             HAVING totalAttempts >= 1
             ORDER BY avgTime DESC
             LIMIT 20`
        );
        const timeData = timeConsuming.map(q => ({
            id: q.question_id,
            text: q.question_text,
            subject: q.subject || '—',
            topic: q.topic || '—',
            avgTime: Math.round(q.avgTime),
            totalAttempts: q.totalAttempts
        }));

        // Quick Stats
        const [totalQ] = await pool.query("SELECT COUNT(*) as cnt FROM questions");
        const [avgErr] = await pool.query(
            `SELECT AVG(CASE WHEN is_attempted = 1 AND is_correct = 0 THEN 1
                              WHEN is_attempted = 1 AND is_correct = 1 THEN 0
                              ELSE NULL END) as avgErrorRate
             FROM question_responses`
        );
        const [avgTimeQ] = await pool.query(
            "SELECT AVG(time_taken_seconds) as avgTime FROM question_responses WHERE is_attempted = 1 AND time_taken_seconds > 0"
        );

        res.json({
            mostIncorrect: incorrectData,
            timeConsuming: timeData,
            quickStats: {
                totalQuestions: totalQ[0].cnt,
                avgErrorRate: avgErr[0].avgErrorRate !== null ? Math.round(avgErr[0].avgErrorRate * 100) : 0,
                avgTime: Math.round(avgTimeQ[0].avgTime || 0)
            }
        });
    } catch (err) {
        console.error('GetQuestionBankAnalytics error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// =========== STUDENT-FACING ENDPOINTS ===========

// GET /api/tests/student/my-tests — Student: get tests for their batch
exports.getStudentTests = async (req, res) => {
    try {
        // Look up student's batch
        const [users] = await pool.query('SELECT desired_batch FROM users WHERE id = ?', [req.user.id]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        const studentBatch = users[0].desired_batch;

        // Get tests that include this batch (test_date <= today, i.e. available to take)
        const [tests] = await pool.query(
            `SELECT * FROM tests WHERE assigned_batches LIKE ? AND test_date <= CURDATE() ORDER BY test_date DESC`,
            [`%${studentBatch}%`]
        );

        // Get student's attempts
        const [attempts] = await pool.query(
            'SELECT test_id FROM test_attempts WHERE user_id = ?',
            [req.user.id]
        );
        const attemptedTestIds = new Set(attempts.map(a => a.test_id));

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const formatted = tests.map(t => {
            const testDate = new Date(t.test_date);
            testDate.setHours(0, 0, 0, 0);
            const isToday = testDate.getTime() === today.getTime();

            return {
                id: t.id,
                title: t.title,
                type: t.test_type,
                date: t.test_date,
                duration: t.duration,
                totalQuestions: t.total_questions,
                totalMarks: t.total_marks,
                assignedTo: t.assigned_batches,
                instructions: t.instructions,
                isToday,
                attempted: attemptedTestIds.has(t.id)
            };
        });

        res.json({ tests: formatted, batch: studentBatch });
    } catch (err) {
        console.error('GetStudentTests error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/start/:id — Student: get questions for a test (grouped by subject, random within)
exports.startTest = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if already attempted
        const [existing] = await pool.query(
            'SELECT id FROM test_attempts WHERE user_id = ? AND test_id = ?',
            [req.user.id, id]
        );
        if (existing.length > 0) {
            return res.status(400).json({ message: 'You have already attempted this test' });
        }

        // Get test info
        const [tests] = await pool.query('SELECT * FROM tests WHERE id = ?', [id]);
        if (tests.length === 0) return res.status(404).json({ message: 'Test not found' });
        const test = tests[0];

        // Get questions
        const [questions] = await pool.query(
            'SELECT * FROM questions WHERE test_id = ? ORDER BY subject ASC',
            [id]
        );

        // Group by subject, shuffle within each group
        const grouped = {};
        questions.forEach(q => {
            const subj = q.subject || 'General';
            if (!grouped[subj]) grouped[subj] = [];
            grouped[subj].push(q);
        });

        // Shuffle function
        const shuffle = (arr) => {
            for (let i = arr.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]];
            }
            return arr;
        };

        // Build final ordered list: subjects in order, questions random within
        const orderedQuestions = [];
        const subjectOrder = Object.keys(grouped).sort();
        subjectOrder.forEach(subj => {
            shuffle(grouped[subj]).forEach(q => {
                orderedQuestions.push({
                    id: q.id,
                    question: q.question_text,
                    options: [q.option_a, q.option_b, q.option_c, q.option_d],
                    answer: q.answer,
                    subject: q.subject || 'General',
                    difficulty: q.difficulty || 'Medium',
                    topic: q.topic || ''
                });
            });
        });

        // Determine scoring based on batch
        const isCET = test.assigned_batches.toUpperCase() === 'CET';
        const scoring = isCET
            ? { correct: 2, incorrect: 0, unattempted: 0 }
            : { correct: 4, incorrect: -1, unattempted: 0 };

        res.json({
            test: {
                id: test.id,
                title: test.title,
                type: test.test_type,
                duration: test.duration,
                totalQuestions: test.total_questions,
                totalMarks: test.total_marks,
                instructions: test.instructions
            },
            questions: orderedQuestions,
            scoring
        });
    } catch (err) {
        console.error('StartTest error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// POST /api/tests/student/submit/:id — Student: record test attempt + question responses
exports.recordAttempt = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { id } = req.params;
        const { score, totalMarks, correctCount, incorrectCount, unattemptedCount, timeTaken, questionResponses } = req.body;

        await connection.query(
            `INSERT INTO test_attempts (user_id, test_id, score, total_marks, correct_count, incorrect_count, unattempted_count, time_taken)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [req.user.id, id, score || 0, totalMarks || 0, correctCount || 0, incorrectCount || 0, unattemptedCount || 0, timeTaken || 0]
        );

        // Store individual question responses
        if (questionResponses && questionResponses.length > 0) {
            const values = questionResponses.map(qr => [
                req.user.id, parseInt(id), qr.questionId,
                qr.selectedAnswer || null, qr.correctAnswer,
                qr.isCorrect ? 1 : 0, qr.isAttempted ? 1 : 0, qr.isRevisited ? 1 : 0,
                qr.timeTaken || 0, qr.difficulty || 'Medium', qr.subject || ''
            ]);
            await connection.query(
                `INSERT INTO question_responses (user_id, test_id, question_id, selected_answer, correct_answer, is_correct, is_attempted, is_revisited, time_taken_seconds, difficulty, subject)
                 VALUES ?`,
                [values]
            );
        }

        await connection.commit();
        res.json({ message: 'Test attempt recorded' });
    } catch (err) {
        await connection.rollback();
        if (err.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'You have already attempted this test' });
        }
        console.error('RecordAttempt error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    } finally {
        connection.release();
    }
};

// GET /api/tests/student/result/:id — Student: get past attempt result + questions + student answers
exports.getAttemptResult = async (req, res) => {
    try {
        const { id } = req.params;

        // Get attempt
        const [attempts] = await pool.query(
            'SELECT * FROM test_attempts WHERE user_id = ? AND test_id = ?',
            [req.user.id, id]
        );
        if (attempts.length === 0) {
            return res.status(404).json({ message: 'No attempt found for this test' });
        }
        const attempt = attempts[0];

        // Get test info
        const [tests] = await pool.query('SELECT * FROM tests WHERE id = ?', [id]);
        if (tests.length === 0) return res.status(404).json({ message: 'Test not found' });
        const test = tests[0];

        // Get questions
        const [questions] = await pool.query(
            'SELECT * FROM questions WHERE test_id = ? ORDER BY subject ASC, id ASC',
            [id]
        );

        // Get student's question responses
        const [responses] = await pool.query(
            'SELECT question_id, selected_answer, is_correct, is_attempted, time_taken_seconds FROM question_responses WHERE user_id = ? AND test_id = ?',
            [req.user.id, id]
        );
        const responseMap = {};
        responses.forEach(r => { responseMap[r.question_id] = r; });

        const formattedQuestions = questions.map(q => {
            const resp = responseMap[q.id];
            return {
                id: q.id,
                question: q.question_text,
                options: [q.option_a, q.option_b, q.option_c, q.option_d],
                answer: q.answer,
                subject: q.subject || 'General',
                difficulty: q.difficulty || 'Medium',
                topic: q.topic || '',
                studentAnswer: resp ? resp.selected_answer : null,
                timeTaken: resp ? resp.time_taken_seconds : 0
            };
        });

        // Find fastest/slowest from responses
        const attemptedResponses = responses.filter(r => r.is_attempted === 1 && r.time_taken_seconds > 0);
        let fastest = null, slowest = null;
        if (attemptedResponses.length > 0) {
            attemptedResponses.sort((a, b) => a.time_taken_seconds - b.time_taken_seconds);
            const fq = attemptedResponses[0];
            const sq = attemptedResponses[attemptedResponses.length - 1];
            const fIdx = questions.findIndex(q => q.id === fq.question_id);
            const sIdx = questions.findIndex(q => q.id === sq.question_id);
            fastest = { idx: fIdx, time: fq.time_taken_seconds };
            slowest = { idx: sIdx, time: sq.time_taken_seconds };
        }

        const isCET = test.assigned_batches.toUpperCase() === 'CET';
        const scoring = isCET
            ? { correct: 2, incorrect: 0, unattempted: 0 }
            : { correct: 4, incorrect: -1, unattempted: 0 };

        res.json({
            attempt: {
                score: attempt.score,
                totalMarks: attempt.total_marks,
                correctCount: attempt.correct_count,
                incorrectCount: attempt.incorrect_count,
                unattemptedCount: attempt.unattempted_count,
                timeTaken: attempt.time_taken,
                attemptedAt: attempt.attempted_at
            },
            test: {
                id: test.id,
                title: test.title,
                type: test.test_type,
                duration: test.duration,
                totalQuestions: test.total_questions,
                totalMarks: test.total_marks
            },
            questions: formattedQuestions,
            scoring,
            fastest,
            slowest
        });
    } catch (err) {
        console.error('GetAttemptResult error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/analytics — Student: comprehensive analytics
exports.getStudentAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;

        // 1. Overall accuracy = average of each test's individual accuracy
        // e.g. Test1: 70%, Test2: 50% → overall = (70+50)/2 = 60%
        const [overallStats] = await pool.query(
            `SELECT COUNT(*) as totalTests,
                    AVG(score) as avgScore,
                    SUM(correct_count) as totalCorrect,
                    SUM(incorrect_count) as totalIncorrect,
                    SUM(unattempted_count) as totalUnattempted,
                    AVG(time_taken) as avgTimeTaken,
                    AVG(CASE WHEN (correct_count + incorrect_count) > 0 THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100) ELSE 0 END) as avgAccuracy
             FROM test_attempts WHERE user_id = ?`, [userId]
        );
        const stats = overallStats[0];
        const overallAccuracy = Math.round(stats.avgAccuracy || 0);

        // 2. Avg time per question from question_responses
        const [avgTimeResult] = await pool.query(
            'SELECT AVG(time_taken_seconds) as avgTimePerQ FROM question_responses WHERE user_id = ? AND is_attempted = 1', [userId]
        );
        const avgTimePerQuestion = Math.round(avgTimeResult[0].avgTimePerQ || 0);

        // 3. Monthly data (last 7 months) — CAST to DECIMAL to avoid integer division
        const [monthlyData] = await pool.query(
            `SELECT DATE_FORMAT(attempted_at, '%Y-%m') as month,
                    AVG(score) as avgScore,
                    AVG(CASE WHEN (correct_count + incorrect_count) > 0 THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100) ELSE 0 END) as avgAccuracy
             FROM test_attempts WHERE user_id = ? AND attempted_at >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)
             GROUP BY month ORDER BY month ASC`, [userId]
        );

        // 4. Weekly scores (last 7 days) — avg score per day
        const [weeklyData] = await pool.query(
            `SELECT DATE(attempted_at) as day, AVG(score) as avgScore, COUNT(*) as testCount
             FROM test_attempts WHERE user_id = ? AND attempted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY day ORDER BY day ASC`, [userId]
        );

        // 5. Tests per day (last 7 days)
        const [testsPerDay] = await pool.query(
            `SELECT DATE(attempted_at) as day, COUNT(*) as tests
             FROM test_attempts WHERE user_id = ? AND attempted_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
             GROUP BY day ORDER BY day ASC`, [userId]
        );

        // 6. Subject-wise accuracy
        const [subjectData] = await pool.query(
            `SELECT subject,
                    SUM(is_correct) as correct,
                    SUM(is_attempted) as attempted
             FROM question_responses WHERE user_id = ? AND subject != ''
             GROUP BY subject`, [userId]
        );

        // 7. Difficulty-wise accuracy
        const [difficultyData] = await pool.query(
            `SELECT difficulty,
                    SUM(is_correct) as correct,
                    SUM(is_attempted) as attempted,
                    COUNT(*) as total
             FROM question_responses WHERE user_id = ?
             GROUP BY difficulty`, [userId]
        );

        // 8. Attempt pattern
        const [attemptPattern] = await pool.query(
            `SELECT
                SUM(is_attempted) as attempted,
                SUM(CASE WHEN is_attempted = 0 THEN 1 ELSE 0 END) as skipped,
                SUM(is_revisited) as revisited,
                COUNT(*) as total
             FROM question_responses WHERE user_id = ?`, [userId]
        );

        // 9. Fastest and slowest questions (attempted only)
        const [fastestQ] = await pool.query(
            `SELECT qr.question_id, qr.time_taken_seconds, q.question_text
             FROM question_responses qr
             LEFT JOIN questions q ON qr.question_id = q.id
             WHERE qr.user_id = ? AND qr.is_attempted = 1
             ORDER BY qr.time_taken_seconds ASC LIMIT 1`, [userId]
        );
        const [slowestQ] = await pool.query(
            `SELECT qr.question_id, qr.time_taken_seconds, q.question_text
             FROM question_responses qr
             LEFT JOIN questions q ON qr.question_id = q.id
             WHERE qr.user_id = ? AND qr.is_attempted = 1
             ORDER BY qr.time_taken_seconds DESC LIMIT 1`, [userId]
        );

        // 10. Score trend (last 10 tests)
        const [scoreTrend] = await pool.query(
            `SELECT ta.score, t.title, ta.attempted_at
             FROM test_attempts ta
             LEFT JOIN tests t ON ta.test_id = t.id
             WHERE ta.user_id = ?
             ORDER BY ta.attempted_at DESC LIMIT 10`, [userId]
        );

        // Format monthly data
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const formattedMonthly = monthlyData.map(m => {
            const [y, mo] = m.month.split('-');
            return {
                month: months[parseInt(mo) - 1],
                score: Math.round(m.avgScore || 0),
                accuracy: Math.round(m.avgAccuracy || 0)
            };
        });

        // Format weekly data
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const formattedWeekly = weeklyData.map(w => ({
            day: dayNames[new Date(w.day).getDay()],
            score: Math.round(w.avgScore || 0),
            date: w.day
        }));

        // Format tests per day
        const formattedTestsPerDay = testsPerDay.map(t => ({
            day: dayNames[new Date(t.day).getDay()],
            tests: t.tests,
            date: t.day
        }));

        // Format subject data
        const subjectColors = { 'Physics': '#EC4899', 'Chemistry': '#F59E0B', 'Mathematics': '#8B5CF6', 'Biology': '#10B981', 'Math': '#8B5CF6' };
        const formattedSubjects = subjectData.map(s => ({
            subject: s.subject,
            accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
            color: subjectColors[s.subject] || '#6B7280'
        }));

        // Format difficulty data
        const diffColors = { 'Easy': '#10B981', 'Medium': '#F59E0B', 'Hard': '#EF4444' };
        const formattedDifficulty = difficultyData.map(d => ({
            name: d.difficulty,
            accuracy: d.attempted > 0 ? Math.round((d.correct / d.attempted) * 100) : 0,
            color: diffColors[d.difficulty] || '#6B7280'
        }));

        // Format attempt pattern
        const ap = attemptPattern[0];
        const apTotal = ap.total || 1;
        const formattedAttemptPattern = [
            { name: 'Attempted', value: Math.round((ap.attempted / apTotal) * 100), color: '#10B981' },
            { name: 'Skipped', value: Math.round((ap.skipped / apTotal) * 100), color: '#6B7280' },
            { name: 'Revisited', value: Math.round((ap.revisited / apTotal) * 100), color: '#8B5CF6' }
        ];

        // Format score trend (reverse for chronological order)
        const formattedScoreTrend = scoreTrend.reverse().map((s, i) => ({
            name: s.title || `Test ${i + 1}`,
            score: s.score
        }));

        // Format fastest/slowest
        const fastest = fastestQ.length > 0 ? {
            question: fastestQ[0].question_text || 'N/A',
            time: fastestQ[0].time_taken_seconds,
            id: fastestQ[0].question_id
        } : null;
        const slowest = slowestQ.length > 0 ? {
            question: slowestQ[0].question_text || 'N/A',
            time: slowestQ[0].time_taken_seconds,
            id: slowestQ[0].question_id
        } : null;

        // 11. Accuracy trend: compare overall accuracy to accuracy excluding the latest test
        // This shows how the latest test changed the overall accuracy
        const [prevAccResult] = await pool.query(
            `SELECT AVG(CASE WHEN (correct_count + incorrect_count) > 0 THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100) ELSE 0 END) as prevAccuracy
             FROM test_attempts WHERE user_id = ? AND id != (SELECT MAX(id) FROM test_attempts WHERE user_id = ?)`, [userId, userId]
        );
        const prevAccuracy = prevAccResult[0].prevAccuracy ? Math.round(prevAccResult[0].prevAccuracy) : null;
        const accuracyTrend = prevAccuracy !== null ? overallAccuracy - prevAccuracy : null;

        const [prevWeekTime] = await pool.query(
            `SELECT AVG(time_taken_seconds) as prevAvgTime FROM question_responses WHERE user_id = ? AND is_attempted = 1 AND responded_at >= DATE_SUB(CURDATE(), INTERVAL 14 DAY) AND responded_at < DATE_SUB(CURDATE(), INTERVAL 7 DAY)`, [userId]
        );
        const prevAvgTime = prevWeekTime[0].prevAvgTime ? Math.round(prevWeekTime[0].prevAvgTime) : null;
        const timeTrend = prevAvgTime !== null ? avgTimePerQuestion - prevAvgTime : null;

        res.json({
            overallAccuracy,
            avgTimePerQuestion,
            totalTests: stats.totalTests || 0,
            scoreTrend: formattedScoreTrend,
            monthlyData: formattedMonthly,
            weeklyData: formattedWeekly,
            testsPerDay: formattedTestsPerDay,
            subjectData: formattedSubjects,
            difficultyData: formattedDifficulty,
            attemptPattern: formattedAttemptPattern,
            fastest,
            slowest,
            accuracyTrend,
            timeTrend
        });
    } catch (err) {
        console.error('GetStudentAnalytics error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/test-history — All test attempts with details
exports.getAllTestAttempts = async (req, res) => {
    try {
        const [attempts] = await pool.query(
            `SELECT ta.*, t.title, t.test_type, t.total_questions, t.duration,
                    ta.time_taken, ta.score, ta.total_marks, ta.correct_count, ta.incorrect_count, ta.unattempted_count,
                    ta.attempted_at
             FROM test_attempts ta
             LEFT JOIN tests t ON ta.test_id = t.id
             WHERE ta.user_id = ?
             ORDER BY ta.attempted_at DESC`, [req.user.id]
        );

        const formatted = attempts.map(a => {
            const attempted = a.correct_count + a.incorrect_count;
            const accuracy = attempted > 0 ? Math.round((a.correct_count / attempted) * 100) : 0;
            const avgTimePerQ = a.total_questions > 0 ? Math.round(a.time_taken / a.total_questions) : 0;
            return {
                testId: a.test_id,
                title: a.title || 'Unknown Test',
                type: a.test_type,
                score: a.score,
                totalMarks: a.total_marks,
                correctCount: a.correct_count,
                incorrectCount: a.incorrect_count,
                unattemptedCount: a.unattempted_count,
                totalQuestions: a.total_questions,
                accuracy,
                avgTimePerQuestion: avgTimePerQ,
                timeTaken: a.time_taken,
                duration: a.duration,
                attemptedAt: a.attempted_at
            };
        });

        res.json({ attempts: formatted });
    } catch (err) {
        console.error('GetAllTestAttempts error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/streak — Student: practice streak, heatmap, active days
exports.getStudentStreak = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get all distinct activity dates (days when student took at least one test)
        const [activityDates] = await pool.query(
            `SELECT DATE(attempted_at) as actDate, COUNT(*) as testCount
             FROM test_attempts WHERE user_id = ?
             GROUP BY actDate
             ORDER BY actDate ASC`, [userId]
        );

        const activeDays = activityDates.length;

        if (activeDays === 0) {
            return res.json({
                currentStreak: 0, largestStreak: 0, avgStreak: 0, activeDays: 0,
                heatmap: {}
            });
        }

        // Build set of active date strings and heatmap
        const dateSet = new Set();
        const heatmap = {};
        activityDates.forEach(row => {
            const ds = row.actDate instanceof Date
                ? row.actDate.toISOString().split('T')[0]
                : new Date(row.actDate).toISOString().split('T')[0];
            dateSet.add(ds);
            heatmap[ds] = row.testCount;
        });

        // Compute all streaks
        const sortedDates = Array.from(dateSet).sort();
        const streaks = [];
        let streakLen = 1;

        for (let i = 1; i < sortedDates.length; i++) {
            const prev = new Date(sortedDates[i - 1]);
            const curr = new Date(sortedDates[i]);
            const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                streakLen++;
            } else {
                streaks.push(streakLen);
                streakLen = 1;
            }
        }
        streaks.push(streakLen);

        const largestStreak = Math.max(...streaks);
        const avgStreak = Math.round(streaks.reduce((a, b) => a + b, 0) / streaks.length);

        // Current streak: count backward from today/yesterday
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString().split('T')[0];
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let practiceStreak = 0;
        if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
            let checkDate = dateSet.has(todayStr) ? new Date(today) : new Date(yesterday);
            while (dateSet.has(checkDate.toISOString().split('T')[0])) {
                practiceStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            }
        }

        res.json({
            currentStreak: practiceStreak,
            largestStreak,
            avgStreak,
            activeDays,
            heatmap
        });
    } catch (err) {
        console.error('GetStudentStreak error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/weak-topics — Student: top 10 weakest topics
exports.getStudentWeakTopics = async (req, res) => {
    try {
        const userId = req.user.id;
        const [weakTopics] = await pool.query(
            `SELECT q.topic, q.subject,
                    SUM(CASE WHEN qr.is_attempted = 1 AND qr.is_correct = 0 THEN 1 ELSE 0 END) as incorrectCount,
                    SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as totalAttempts
             FROM question_responses qr
             JOIN questions q ON qr.question_id = q.id
             WHERE qr.user_id = ? AND q.topic IS NOT NULL AND q.topic != '' AND qr.is_attempted = 1
             GROUP BY q.topic, q.subject
             HAVING totalAttempts >= 1
             ORDER BY (incorrectCount / totalAttempts) DESC
             LIMIT 10`,
            [userId]
        );
        const formatted = weakTopics.map(t => ({
            topic: t.topic,
            subject: t.subject,
            errorRate: Math.round((t.incorrectCount / t.totalAttempts) * 100),
            totalAttempts: t.totalAttempts
        }));
        res.json({ weakTopics: formatted });
    } catch (err) {
        console.error('GetStudentWeakTopics error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// GET /api/tests/student/notifications — Student: real notifications
exports.getStudentNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const notifications = [];

        // Get student's batch
        const [userRes] = await pool.query('SELECT desired_batch FROM users WHERE id = ?', [userId]);
        const userBatch = userRes[0]?.desired_batch || '';

        // 1. Today's tests for student's batch
        const today = new Date().toISOString().split('T')[0];
        const [todaysTests] = await pool.query(
            `SELECT id, title, test_type, duration, total_questions
             FROM tests
             WHERE test_date = ? AND (assigned_batches LIKE ? OR assigned_batches LIKE ? OR assigned_batches LIKE ? OR assigned_batches = ?)
             ORDER BY created_at DESC`,
            [today, `%${userBatch}%`, `${userBatch},%`, `%,${userBatch}`, userBatch]
        );
        // Check which ones the student has already attempted
        const [attemptedTests] = await pool.query(
            'SELECT test_id FROM test_attempts WHERE user_id = ?', [userId]
        );
        const attemptedSet = new Set(attemptedTests.map(a => a.test_id));

        todaysTests.forEach(test => {
            if (!attemptedSet.has(test.id)) {
                notifications.push({
                    id: `today-${test.id}`,
                    type: 'alert',
                    title: 'Attempt Today\'s Test',
                    message: `${test.title} (${test.total_questions} Qs, ${test.duration} min) is waiting for you!`,
                    icon: '📝',
                    category: 'Test Alerts',
                    priority: 1,
                    date: today,
                    time: 'Today'
                });
            }
        });

        // 2. Streak notification
        const [activityDates] = await pool.query(
            `SELECT DATE(attempted_at) as actDate FROM test_attempts WHERE user_id = ? GROUP BY actDate ORDER BY actDate DESC`, [userId]
        );
        if (activityDates.length > 0) {
            const dateSet = new Set(activityDates.map(r => {
                const d = r.actDate instanceof Date ? r.actDate : new Date(r.actDate);
                return d.toISOString().split('T')[0];
            }));
            const todayDate = new Date(); todayDate.setHours(0, 0, 0, 0);
            const todayStr = todayDate.toISOString().split('T')[0];
            const yesterdayDate = new Date(todayDate); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
            const yesterdayStr = yesterdayDate.toISOString().split('T')[0];
            let streak = 0;
            if (dateSet.has(todayStr) || dateSet.has(yesterdayStr)) {
                let check = dateSet.has(todayStr) ? new Date(todayDate) : new Date(yesterdayDate);
                while (dateSet.has(check.toISOString().split('T')[0])) { streak++; check.setDate(check.getDate() - 1); }
            }
            if (streak > 0) {
                notifications.push({
                    id: 'streak',
                    type: 'achievement',
                    title: `🔥 ${streak}-Day Streak!`,
                    message: streak >= 7 ? `Amazing! You've been practicing for ${streak} days straight!` : `Keep going! ${streak} day streak — practice today to keep it alive!`,
                    icon: '🔥',
                    category: 'Achievement Alerts',
                    priority: 2,
                    date: today,
                    time: 'Today'
                });
            }
        }

        // 3. Recently created tests for student's batch (last 7 days)
        const [recentTests] = await pool.query(
            `SELECT id, title, test_type, test_date, total_questions, created_at
             FROM tests
             WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
               AND (assigned_batches LIKE ? OR assigned_batches LIKE ? OR assigned_batches LIKE ? OR assigned_batches = ?)
             ORDER BY created_at DESC
             LIMIT 5`,
            [`%${userBatch}%`, `${userBatch},%`, `%,${userBatch}`, userBatch]
        );
        recentTests.forEach(test => {
            const testDate = new Date(test.test_date || test.created_at);
            const dStr = testDate.toISOString().split('T')[0];
            if (dStr !== today || attemptedSet.has(test.id)) {
                const daysAgo = Math.floor((new Date() - new Date(test.created_at)) / (1000 * 60 * 60 * 24));
                notifications.push({
                    id: `new-test-${test.id}`,
                    type: 'alert',
                    title: 'New Test Available',
                    message: `${test.title} — ${test.total_questions} Questions · ${test.test_type}`,
                    icon: '📢',
                    category: 'Test Alerts',
                    priority: 3,
                    date: dStr,
                    time: daysAgo === 0 ? 'Today' : daysAgo === 1 ? 'Yesterday' : `${daysAgo} days ago`
                });
            }
        });

        // Sort: priority first, then date
        notifications.sort((a, b) => a.priority - b.priority);

        res.json({ notifications });
    } catch (err) {
        console.error('GetStudentNotifications error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
