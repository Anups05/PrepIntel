const { generateInsights, generateStudentInsights } = require('../services/aiService');

// GET /api/ai/insights — Admin: get AI-generated platform insights
exports.getAIInsights = async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: 'GROQ_API_KEY is not configured in server .env' });
        }

        const insights = await generateInsights();
        res.json(insights);
    } catch (err) {
        console.error('GetAIInsights error:', err);
        res.status(500).json({
            message: 'Failed to generate AI insights',
            error: err.message
        });
    }
};

// GET /api/ai/student-insights — Student: get personalized AI insights
exports.getStudentAIInsights = async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({ message: 'GROQ_API_KEY is not configured in server .env' });
        }

        const userId = req.user.id;
        const insights = await generateStudentInsights(userId);
        res.json(insights);
    } catch (err) {
        console.error('GetStudentAIInsights error:', err);
        res.status(500).json({
            message: 'Failed to generate personalized insights',
            error: err.message
        });
    }
};
