import axios from 'axios';
import type { CategoriesPayload, CategoryJson } from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(
  /\/$/,
  ''
);
const API_URL = `${API_BASE_URL}/api/categories`;

export interface SaveCategoriesResponse {
  success: boolean;
  message: string;
}

export interface UpdateCategoryResponse {
  success: boolean;
  category: CategoryJson;
}

export interface DeleteCategoryResponse {
  success: boolean;
  removed: CategoryJson;
}

export interface ReloadCategoriesResponse {
  success: boolean;
  message: string;
  data: CategoriesPayload;
}

export async function getCategories(): Promise<CategoriesPayload> {
  const response = await axios.get<CategoriesPayload>(API_URL);
  return response.data;
}

export async function saveCategories(
  categories: CategoriesPayload
): Promise<SaveCategoriesResponse> {
  const response = await axios.post<SaveCategoriesResponse>(API_URL, categories);
  return response.data;
}

export async function getCategory(name: string): Promise<CategoryJson> {
  const response = await axios.get<CategoryJson>(`${API_URL}/${name}`);
  return response.data;
}

export async function updateCategory(
  name: string,
  category: CategoryJson
): Promise<UpdateCategoryResponse> {
  const response = await axios.put<UpdateCategoryResponse>(`${API_URL}/${name}`, category);
  return response.data;
}

export async function deleteCategory(name: string): Promise<DeleteCategoryResponse> {
  const response = await axios.delete<DeleteCategoryResponse>(`${API_URL}/${name}`);
  return response.data;
}

export async function reloadCategories(): Promise<ReloadCategoriesResponse> {
  const response = await axios.post<ReloadCategoriesResponse>(`${API_URL}/reload`);
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
