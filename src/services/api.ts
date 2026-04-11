import axios from 'axios';
import type { CategoriesPayload, CategoryJson } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);
const API_URL = `${API_BASE_URL}/api/categories`;

export async function getCategories(): Promise<CategoriesPayload> {
  const response = await axios.get<CategoriesPayload>(API_URL);
  return response.data;
}

export async function saveCategories(categories: CategoriesPayload): Promise<CategoriesPayload> {
  const response = await axios.post<CategoriesPayload>(API_URL, categories);
  return response.data;
}

export async function getCategory(name: string): Promise<CategoryJson> {
  const response = await axios.get<CategoryJson>(`${API_URL}/${name}`);
  return response.data;
}

export async function updateCategory(name: string, category: CategoryJson): Promise<CategoryJson> {
  const response = await axios.put<CategoryJson>(`${API_URL}/${name}`, category);
  return response.data;
}

export async function deleteCategory(
  name: string
): Promise<{ success?: boolean; message?: string }> {
  const response = await axios.delete<{ success?: boolean; message?: string }>(
    `${API_URL}/${name}`
  );
  return response.data;
}

export async function reloadCategories(): Promise<CategoriesPayload> {
  const response = await axios.post<CategoriesPayload>(`${API_URL}/reload`);
  return response.data;
}

export async function exportCategories(): Promise<Blob> {
  const response = await axios.get<Blob>(`${API_URL}/export`, {
    responseType: 'blob',
  });
  return response.data;
}

export async function getBackup(): Promise<Blob> {
  const response = await axios.get<Blob>(`${API_URL}/backup`, {
    responseType: 'blob',
  });
  return response.data;
}
