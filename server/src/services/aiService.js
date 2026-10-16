const Groq = require('groq-sdk');
const { pool } = require('../config/db');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/**
 * Gather comprehensive platform data from the database
 */
const gatherPlatformData = async () => {
    // 1. Per-student stats
    const [students] = await pool.query(
        `SELECT u.id, u.name, u.desired_batch as batch, u.streak, u.tests_taken,
                COUNT(ta.id) as attemptCount,
                AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                    THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as avgAccuracy,
                AVG(ta.score) as avgScore,
                MAX(ta.attempted_at) as lastAttempt
         FROM users u
         LEFT JOIN test_attempts ta ON u.id = ta.user_id
         WHERE u.role = 'student'
         GROUP BY u.id
         ORDER BY avgAccuracy ASC`
    );

    // 2. Per-student recent vs older accuracy (for decline detection)
    const [recentAccuracy] = await pool.query(
        `SELECT ta.user_id,
                AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                    THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as recentAcc
         FROM test_attempts ta
         JOIN users u ON ta.user_id = u.id
         WHERE u.role = 'student' AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY ta.user_id`
    );
    const [olderAccuracy] = await pool.query(
        `SELECT ta.user_id,
                AVG(CASE WHEN (ta.correct_count + ta.incorrect_count) > 0
                    THEN (CAST(ta.correct_count AS DECIMAL) / CAST(ta.correct_count + ta.incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as olderAcc
         FROM test_attempts ta
         JOIN users u ON ta.user_id = u.id
         WHERE u.role = 'student'
           AND ta.attempted_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
           AND ta.attempted_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY ta.user_id`
    );

    const recentMap = {};
    recentAccuracy.forEach(r => { recentMap[r.user_id] = Math.round(r.recentAcc * 10) / 10; });
    const olderMap = {};
    olderAccuracy.forEach(r => { olderMap[r.user_id] = Math.round(r.olderAcc * 10) / 10; });

    const studentData = students.map(s => ({
        id: s.id,
        name: s.name,
        batch: s.batch || 'Unknown',
        streak: s.streak || 0,
        testsTaken: s.attemptCount || 0,
        avgAccuracy: Math.round((s.avgAccuracy || 0) * 10) / 10,
        avgScore: Math.round(s.avgScore || 0),
        recentAccuracy: recentMap[s.id] ?? null,
        olderAccuracy: olderMap[s.id] ?? null,
        lastAttempt: s.lastAttempt
    }));

    // 3. Batch-wise stats
    const batches = ['JEE Advanced', 'JEE Main', 'NEET', 'CET'];
    const batchStats = [];
    for (const batch of batches) {
        const batchStudents = studentData.filter(s => s.batch === batch);
        const count = batchStudents.length;
        const avgAcc = count > 0 ? Math.round(batchStudents.reduce((s, st) => s + st.avgAccuracy, 0) / count * 10) / 10 : 0;
        batchStats.push({ name: batch, students: count, avgAccuracy: avgAcc });
    }

    // 4. Subject-wise accuracy
    const [subjectStats] = await pool.query(
        `SELECT qr.subject,
                SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as attempted,
                COUNT(DISTINCT qr.user_id) as studentCount
         FROM question_responses qr
         WHERE qr.subject IS NOT NULL AND qr.subject != ''
         GROUP BY qr.subject`
    );

    // 5. Topic-level error rates
    const [topicStats] = await pool.query(
        `SELECT q.topic, q.subject,
                COUNT(DISTINCT qr.user_id) as studentsAttempted,
                SUM(CASE WHEN qr.is_attempted = 1 AND qr.is_correct = 0 THEN 1 ELSE 0 END) as incorrectCount,
                SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as totalAttempts
         FROM question_responses qr
         JOIN questions q ON qr.question_id = q.id
         WHERE q.topic IS NOT NULL AND q.topic != '' AND qr.is_attempted = 1
         GROUP BY q.topic, q.subject
         HAVING totalAttempts >= 1
         ORDER BY (incorrectCount / totalAttempts) DESC
         LIMIT 20`
    );

    // 6. Per-batch subject decline (last 30 days vs previous 30 days)
    const [recentBatchSubject] = await pool.query(
        `SELECT u.desired_batch as batch, qr.subject,
                SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as attempted,
                COUNT(DISTINCT qr.user_id) as studentCount
         FROM question_responses qr
         JOIN users u ON qr.user_id = u.id
         WHERE u.role = 'student' AND qr.subject IS NOT NULL AND qr.subject != ''
           AND qr.responded_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY u.desired_batch, qr.subject`
    );
    const [olderBatchSubject] = await pool.query(
        `SELECT u.desired_batch as batch, qr.subject,
                SUM(CASE WHEN qr.is_correct = 1 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as attempted
         FROM question_responses qr
         JOIN users u ON qr.user_id = u.id
         WHERE u.role = 'student' AND qr.subject IS NOT NULL AND qr.subject != ''
           AND qr.responded_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
           AND qr.responded_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)
         GROUP BY u.desired_batch, qr.subject`
    );

    // 7. Test stats
    const [testStats] = await pool.query(
        `SELECT COUNT(*) as totalTests,
                SUM(CASE WHEN status = 'Completed' THEN 1 ELSE 0 END) as completedTests,
                SUM(CASE WHEN status = 'Active' THEN 1 ELSE 0 END) as activeTests
         FROM tests`
    );

    // 8. Time management per subject
    const [timeStats] = await pool.query(
        `SELECT subject,
                AVG(time_taken_seconds) as avgTime,
                COUNT(*) as totalResponses
         FROM question_responses
         WHERE is_attempted = 1 AND time_taken_seconds > 0
           AND subject IS NOT NULL AND subject != ''
         GROUP BY subject`
    );

    return {
        students: studentData,
        batchStats,
        subjectStats: subjectStats.map(s => ({
            subject: s.subject,
            accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
            studentCount: s.studentCount,
            totalAttempts: s.attempted
        })),
        topicStats: topicStats.map(t => ({
            topic: t.topic,
            subject: t.subject,
            errorRate: t.totalAttempts > 0 ? Math.round((t.incorrectCount / t.totalAttempts) * 100) : 0,
            studentsAttempted: t.studentsAttempted,
            totalAttempts: t.totalAttempts
        })),
        batchSubjectRecent: recentBatchSubject.map(r => ({
            batch: r.batch, subject: r.subject,
            accuracy: r.attempted > 0 ? Math.round((r.correct / r.attempted) * 100) : 0,
            studentCount: r.studentCount
        })),
        batchSubjectOlder: olderBatchSubject.map(r => ({
            batch: r.batch, subject: r.subject,
            accuracy: r.attempted > 0 ? Math.round((r.correct / r.attempted) * 100) : 0
        })),
        testStats: testStats[0],
        timeStats: timeStats.map(t => ({
            subject: t.subject,
            avgTime: Math.round(t.avgTime),
            totalResponses: t.totalResponses
        }))
    };
};

/**
 * Generate AI insights using Groq
 */
const generateInsights = async () => {
    const data = await gatherPlatformData();

    const prompt = `You are an expert educational analytics AI for a coaching platform called PrepIntel that prepares students for JEE Advanced, JEE Main, NEET, and CET exams.

Analyze the following comprehensive student performance data from our database and generate actionable insights.

=== STUDENT DATA (${data.students.length} students) ===
${JSON.stringify(data.students.slice(0, 100), null, 1)}

=== BATCH STATISTICS ===
${JSON.stringify(data.batchStats, null, 1)}

=== SUBJECT-WISE ACCURACY ===
${JSON.stringify(data.subjectStats, null, 1)}

=== TOPIC ERROR RATES (Top 20 weakest) ===
${JSON.stringify(data.topicStats, null, 1)}

=== BATCH-SUBJECT ACCURACY (Last 30 days) ===
${JSON.stringify(data.batchSubjectRecent, null, 1)}

=== BATCH-SUBJECT ACCURACY (30-60 days ago) ===
${JSON.stringify(data.batchSubjectOlder, null, 1)}

=== TEST STATISTICS ===
${JSON.stringify(data.testStats, null, 1)}

=== TIME MANAGEMENT PER SUBJECT ===
${JSON.stringify(data.timeStats, null, 1)}

Based on this data, return a JSON response with EXACTLY this structure. Do NOT include any text outside the JSON. Every field must be present.

{
  "summary": {
    "atRiskCount": <number of students with avgAccuracy < 40 or declining performance>,
    "atRiskTrend": "<percentage change string like '+12%' or '-5%' compared to previous period>",
    "decliningBatches": <number of batch-subject combinations showing decline>,
    "weakTopicCount": <number of topics with error rate > 50%>,
    "recommendationCount": <total number of recommendations you generate>,
    "highPriorityCount": <number of high priority recommendations>
  },
  "atRiskStudents": [
    {
      "name": "<student name>",
      "batch": "<batch name>",
      "accuracy": <current accuracy number>,
      "decline": "<decline percentage like '-8%'>",
      "reason": "<brief reason for being at risk>"
    }
  ],
  "decliningAlerts": [
    {
      "batch": "<batch name>",
      "subject": "<subject name>",
      "decline": "<decline percentage like '-8%'>",
      "students": <number of students affected>
    }
  ],
  "weakClusters": [
    {
      "topic": "<topic name>",
      "students": <number of students struggling>,
      "avgError": <error rate percentage number>,
      "subjects": ["<subject name>"]
    }
  ],
  "recommendations": [
    {
      "title": "<actionable title about a topic or batch>",
      "description": "<detailed description focused on topic or batch performance, NOT about individual students>",
      "priority": "High" or "Medium" or "Low"
    }
  ],
  "riskDistribution": [
    {
      "name": "<batch name>",
      "highRisk": <count of students with accuracy < 40%>,
      "mediumRisk": <count of students with accuracy 40-65%>,
      "lowRisk": <count of students with accuracy > 65%>
    }
  ],
  "topPerformers": [
    {
      "name": "<student name>",
      "batch": "<batch name>",
      "accuracy": <accuracy number>,
      "streak": <streak number>
    }
  ],
  "aiNarrative": "<A comprehensive 2-3 sentence paragraph summarizing the overall platform health, key concerns, and recommended next steps>"
}

IMPORTANT RULES:
1. Use ONLY real student names and data from the provided data. Do NOT invent names.
2. If there are no students or no data, return empty arrays and zeros.
3. atRiskStudents: include up to 8 students with lowest accuracy or biggest decline.
4. decliningAlerts: compare recent vs older batch-subject accuracy to find real declines.
5. weakClusters: use the actual topic error rate data provided.
6. recommendations: MUST be topic-wise or batch-wise ONLY. Do NOT mention individual student names or give student-specific recommendations. Focus on things like "Focus on [Topic] in [Batch]", "Create more tests for [Subject]", "Review [Topic] across [Batch]", etc.
7. riskDistribution: must include all 4 batches (JEE Advanced, JEE Main, NEET, CET).
8. topPerformers: include up to 5 students with highest accuracy.
9. Return ONLY valid JSON, no markdown, no code fences, no explanation text.`;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
        parsed = JSON.parse(responseText);
    } catch (e) {
        // Try to extract JSON from the response
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Failed to parse AI response as JSON');
        }
    }

    // Ensure all required fields exist with defaults
    return {
        summary: {
            atRiskCount: parsed.summary?.atRiskCount ?? 0,
            atRiskTrend: parsed.summary?.atRiskTrend ?? '0%',
            decliningBatches: parsed.summary?.decliningBatches ?? 0,
            weakTopicCount: parsed.summary?.weakTopicCount ?? 0,
            recommendationCount: parsed.summary?.recommendationCount ?? 0,
            highPriorityCount: parsed.summary?.highPriorityCount ?? 0
        },
        atRiskStudents: parsed.atRiskStudents || [],
        decliningAlerts: parsed.decliningAlerts || [],
        weakClusters: parsed.weakClusters || [],
        recommendations: parsed.recommendations || [],
        riskDistribution: parsed.riskDistribution || [],
        topPerformers: parsed.topPerformers || [],
        aiNarrative: parsed.aiNarrative || 'No insights available yet. Add more student data to generate meaningful analysis.'
    };
};

/**
 * Gather data for a specific student
 */
const gatherStudentData = async (userId) => {
    // 1. Student info
    const [userRows] = await pool.query(
        `SELECT id, name, desired_batch as batch, streak, tests_taken FROM users WHERE id = ?`, [userId]
    );
    if (userRows.length === 0) throw new Error('Student not found');
    const student = userRows[0];

    // 2. Test attempts with scores
    const [attempts] = await pool.query(
        `SELECT ta.test_id, t.title as testTitle, ta.score, ta.total_marks,
                ta.correct_count, ta.incorrect_count, ta.unattempted_count,
                ta.time_taken, ta.attempted_at
         FROM test_attempts ta
         JOIN tests t ON ta.test_id = t.id
         WHERE ta.user_id = ?
         ORDER BY ta.attempted_at DESC`, [userId]
    );

    // 3. Subject-wise accuracy for this student
    const [subjectStats] = await pool.query(
        `SELECT subject,
                SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct,
                SUM(CASE WHEN is_attempted = 1 THEN 1 ELSE 0 END) as attempted,
                AVG(CASE WHEN is_attempted = 1 AND time_taken_seconds > 0 THEN time_taken_seconds ELSE NULL END) as avgTime
         FROM question_responses
         WHERE user_id = ? AND subject IS NOT NULL AND subject != ''
         GROUP BY subject`, [userId]
    );

    // 4. Topic-level errors for this student
    const [topicStats] = await pool.query(
        `SELECT q.topic, q.subject,
                SUM(CASE WHEN qr.is_attempted = 1 AND qr.is_correct = 0 THEN 1 ELSE 0 END) as incorrectCount,
                SUM(CASE WHEN qr.is_attempted = 1 THEN 1 ELSE 0 END) as totalAttempts
         FROM question_responses qr
         JOIN questions q ON qr.question_id = q.id
         WHERE qr.user_id = ? AND q.topic IS NOT NULL AND q.topic != '' AND qr.is_attempted = 1
         GROUP BY q.topic, q.subject
         HAVING totalAttempts >= 1
         ORDER BY (incorrectCount / totalAttempts) DESC
         LIMIT 15`, [userId]
    );

    // 5. Recent vs older accuracy (for trend)
    const [recentAcc] = await pool.query(
        `SELECT AVG(CASE WHEN (correct_count + incorrect_count) > 0
                THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100)
                ELSE 0 END) as acc
         FROM test_attempts WHERE user_id = ? AND attempted_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`, [userId]
    );
    const [olderAcc] = await pool.query(
        `SELECT AVG(CASE WHEN (correct_count + incorrect_count) > 0
                THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100)
                ELSE 0 END) as acc
         FROM test_attempts WHERE user_id = ?
           AND attempted_at >= DATE_SUB(CURDATE(), INTERVAL 60 DAY)
           AND attempted_at < DATE_SUB(CURDATE(), INTERVAL 30 DAY)`, [userId]
    );

    // 6. Overall stats
    const [overallStats] = await pool.query(
        `SELECT COUNT(*) as testsTaken,
                AVG(CASE WHEN (correct_count + incorrect_count) > 0
                    THEN (CAST(correct_count AS DECIMAL) / CAST(correct_count + incorrect_count AS DECIMAL) * 100)
                    ELSE 0 END) as avgAccuracy,
                AVG(score) as avgScore,
                SUM(correct_count) as totalCorrect,
                SUM(incorrect_count) as totalIncorrect,
                SUM(unattempted_count) as totalUnattempted
         FROM test_attempts WHERE user_id = ?`, [userId]
    );

    // Pre-compute avgTimePerQuestion so the AI model doesn't output math expressions
    const totalQuestions = (overallStats[0].totalCorrect || 0) + (overallStats[0].totalIncorrect || 0) + (overallStats[0].totalUnattempted || 0);
    const totalTimeTaken = attempts.reduce((sum, a) => sum + (a.time_taken || 0), 0);
    const avgTimePerQuestion = totalQuestions > 0 ? Math.round((totalTimeTaken / totalQuestions) * 10) / 10 : 0;

    return {
        student: { name: student.name, batch: student.batch, streak: student.streak || 0 },
        overallStats: {
            testsTaken: overallStats[0].testsTaken || 0,
            avgAccuracy: Math.round((overallStats[0].avgAccuracy || 0) * 10) / 10,
            avgScore: Math.round(overallStats[0].avgScore || 0),
            totalCorrect: overallStats[0].totalCorrect || 0,
            totalIncorrect: overallStats[0].totalIncorrect || 0,
            totalUnattempted: overallStats[0].totalUnattempted || 0,
            avgTimePerQuestion
        },
        recentAccuracy: recentAcc[0].acc ? Math.round(recentAcc[0].acc * 10) / 10 : null,
        olderAccuracy: olderAcc[0].acc ? Math.round(olderAcc[0].acc * 10) / 10 : null,
        attempts: attempts.map(a => ({
            testTitle: a.testTitle, score: a.score, totalMarks: a.total_marks,
            correct: a.correct_count, incorrect: a.incorrect_count,
            unattempted: a.unattempted_count, timeTaken: a.time_taken,
            accuracy: (a.correct_count + a.incorrect_count) > 0
                ? Math.round((a.correct_count / (a.correct_count + a.incorrect_count)) * 100) : 0,
            date: a.attempted_at
        })),
        subjectStats: subjectStats.map(s => ({
            subject: s.subject,
            accuracy: s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0,
            attempted: s.attempted,
            avgTime: s.avgTime ? Math.round(s.avgTime) : 0
        })),
        topicStats: topicStats.map(t => ({
            topic: t.topic, subject: t.subject,
            errorRate: t.totalAttempts > 0 ? Math.round((t.incorrectCount / t.totalAttempts) * 100) : 0,
            totalAttempts: t.totalAttempts
        }))
    };
};

/**
 * Generate personalized AI insights for a specific student
 */
const generateStudentInsights = async (userId) => {
    const data = await gatherStudentData(userId);

    const prompt = `You are a personal AI tutor for ${data.student.name} on PrepIntel, a coaching platform for ${data.student.batch} exam preparation.

Analyze this student's complete performance data and generate personalized insights and study recommendations.

=== STUDENT PROFILE ===
Name: ${data.student.name}
Batch: ${data.student.batch}
Streak: ${data.student.streak} days

=== OVERALL STATS ===
${JSON.stringify(data.overallStats, null, 1)}

Pre-computed average time per question: ${data.overallStats.avgTimePerQuestion} seconds

=== ACCURACY TREND ===
Recent (last 30 days): ${data.recentAccuracy ?? 'No data'}%
Previous (30-60 days ago): ${data.olderAccuracy ?? 'No data'}%

=== TEST HISTORY (most recent first) ===
${JSON.stringify(data.attempts.slice(0, 20), null, 1)}

=== SUBJECT-WISE PERFORMANCE ===
${JSON.stringify(data.subjectStats, null, 1)}

=== WEAK TOPICS (highest error rate first) ===
${JSON.stringify(data.topicStats, null, 1)}

Return a JSON response with EXACTLY this structure. Do NOT include any text outside the JSON.

{
  "performanceSummary": {
    "overallAccuracy": <number>,
    "accuracyTrend": "<string like '+5%' or '-3%' or 'stable'>",
    "testsTaken": <number>,
    "strongestSubject": "<subject name>",
    "strongestSubjectAccuracy": <number>,
    "weakestSubject": "<subject name>",
    "weakestSubjectAccuracy": <number>,
    "avgTimePerQuestion": <number in seconds>,
    "overallVerdict": "<one of: 'Excellent', 'Good', 'Average', 'Needs Improvement', 'Critical'>"
  },
  "weakTopics": [
    {
      "topic": "<topic name>",
      "subject": "<subject>",
      "errorRate": <number>,
      "priority": "High" or "Medium" or "Low",
      "suggestion": "<brief study tip>"
    }
  ],
  "subjectBreakdown": [
    {
      "subject": "<subject name>",
      "accuracy": <number>,
      "avgTime": <seconds>,
      "trend": "<improving/declining/stable>",
      "tip": "<brief actionable tip>"
    }
  ],
  "timeManagement": {
    "avgTimePerQ": <number>,
    "fastestSubject": "<subject>",
    "fastestTime": <seconds>,
    "slowestSubject": "<subject>",
    "slowestTime": <seconds>,
    "advice": "<brief time management advice>"
  },
  "studyStrategy": [
    {
      "title": "<strategy title>",
      "description": "<detailed personalized advice>",
      "priority": "High" or "Medium" or "Low"
    }
  ],
  "scoreAnalysis": {
    "avgScore": <number>,
    "bestTestScore": <number or null>,
    "bestTestName": "<test name or null>",
    "recentTrend": "<improving/declining/stable>",
    "projectedScore": "<projected score if trend continues>"
  },
  "aiNarrative": "<A personalized 2-3 sentence paragraph addressing ${data.student.name} directly, summarizing their performance, highlighting key strengths, and suggesting immediate next steps>"
}

IMPORTANT RULES:
1. Base ALL insights on the actual data provided. Do NOT invent data.
2. If there is no test data, return zeros and empty arrays with a narrative saying they should take tests.
3. weakTopics: use the actual topic error rates from the data.
4. studyStrategy: make recommendations specific to their weak areas and exam type (${data.student.batch}).
5. Address the student by name in the aiNarrative.
6. Return ONLY valid JSON, no markdown, no code fences, no explanation text.
7. ALL numeric values MUST be plain numbers (e.g. 1.125, 2, 100). NEVER use mathematical expressions like "18 / 16" or "5 * 2" as values — always compute and write the final number.
8. Use the pre-computed avgTimePerQuestion value (${data.overallStats.avgTimePerQuestion}) directly instead of calculating it yourself.`;

    const chatCompletion = await groq.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        model: "llama-3.3-70b-versatile",
        temperature: 0.3,
        max_tokens: 4096,
        response_format: { type: "json_object" }
    });

    const responseText = chatCompletion.choices[0]?.message?.content || '{}';

    let parsed;
    try {
        parsed = JSON.parse(responseText);
    } catch (e) {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        } else {
            throw new Error('Failed to parse AI response as JSON');
        }
    }

    return {
        performanceSummary: parsed.performanceSummary || {},
        weakTopics: parsed.weakTopics || [],
        subjectBreakdown: parsed.subjectBreakdown || [],
        timeManagement: parsed.timeManagement || {},
        studyStrategy: parsed.studyStrategy || [],
        scoreAnalysis: parsed.scoreAnalysis || {},
        aiNarrative: parsed.aiNarrative || `Hi ${data.student.name}! Take some tests to get personalized AI insights.`
    };
};

module.exports = { generateInsights, generateStudentInsights };
