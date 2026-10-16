import api from './api';

// Admin endpoints
export const createTest = (data) => api.post('/tests', data);
export const getAllTests = () => api.get('/tests');
export const getTestById = (id) => api.get(`/tests/${id}`);
export const updateTest = (id, data) => api.put(`/tests/${id}`, data);
export const deleteTest = (id) => api.delete(`/tests/${id}`);
export const getTestStats = () => api.get('/tests/stats/overview');
export const getAllQuestions = () => api.get('/tests/questions/all');

// Student endpoints
export const getStudentTests = () => api.get('/tests/student/my-tests');
export const startStudentTest = (id) => api.get(`/tests/student/start/${id}`);
export const submitStudentTest = (id, data) => api.post(`/tests/student/submit/${id}`, data);
export const getAttemptResult = (id) => api.get(`/tests/student/result/${id}`);
export const getStudentAnalytics = () => api.get('/tests/student/analytics');
export const getTestHistory = () => api.get('/tests/student/test-history');
export const getAdminAnalytics = (period) => api.get('/tests/admin/analytics', { params: { period } });
export const getBatchAnalytics = (trendPeriod) => api.get('/tests/admin/batch-analytics', { params: { trendPeriod } });
export const getBatchDetails = (batchName) => api.get(`/tests/admin/batch-details/${encodeURIComponent(batchName)}`);
export const getQuestionBankAnalytics = () => api.get('/tests/questions/analytics');
export const getStudentStreak = () => api.get('/tests/student/streak');
export const getStudentWeakTopics = () => api.get('/tests/student/weak-topics');
export const getStudentNotifications = () => api.get('/tests/student/notifications');

// AI Insights
export const getAIInsights = () => api.get('/ai/insights');
export const getStudentAIInsights = () => api.get('/ai/student-insights');
