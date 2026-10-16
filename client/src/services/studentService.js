import api from './api';

export const getAllStudents = (params) => api.get('/students', { params });
export const deleteStudent = (id) => api.delete(`/students/${id}`);
export const deleteBulkStudents = (ids) => api.delete('/students/bulk', { data: { ids } });
export const getMyProfile = () => api.get('/auth/me');
export const updateMyProfile = (data) => api.put('/students/me/profile', data);
export const changePassword = (data) => api.put('/students/me/password', data);
export const getBatchStats = () => api.get('/students/stats/batches');
export const getStudentsByBatch = (batchName) => api.get(`/students/batch/${encodeURIComponent(batchName)}`);
