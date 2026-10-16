import api from './api';

export const registerUser = async (userData) => {
  const { data } = await api.post('/auth/register', userData);
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const loginUser = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const adminLogin = async (email, password) => {
  const { data } = await api.post('/auth/admin/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('isAdmin', 'true');
  localStorage.setItem('user', JSON.stringify(data.admin));
  return data;
};

export const logoutUser = () => {
  localStorage.clear();
};

export const getCurrentUser = () => JSON.parse(localStorage.getItem('user'));