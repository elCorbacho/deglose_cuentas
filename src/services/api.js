import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');
const API_URL = `${API_BASE_URL}/api/categories`;

const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

const saveCategories = async (categories) => {
  const response = await axios.post(API_URL, categories);
  return response.data;
};

const getCategory = async (name) => {
  const response = await axios.get(`${API_URL}/${name}`);
  return response.data;
};

const updateCategory = async (name, category) => {
  const response = await axios.put(`${API_URL}/${name}`, category);
  return response.data;
};

const deleteCategory = async (name) => {
  const response = await axios.delete(`${API_URL}/${name}`);
  return response.data;
};

const reloadCategories = async () => {
  const response = await axios.post(`${API_URL}/reload`);
  return response.data;
};

const exportCategories = async () => {
  const response = await axios.get(`${API_URL}/export`, {
    responseType: 'blob'
  });
  return response.data;
};

const getBackup = async () => {
  const response = await axios.get(`${API_URL}/backup`, {
    responseType: 'blob'
  });
  return response.data;
};

export { 
  getCategories, 
  saveCategories, 
  getCategory, 
  updateCategory, 
  deleteCategory,
  reloadCategories,
  exportCategories, 
  getBackup 
};
