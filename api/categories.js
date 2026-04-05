/**
 * Vercel Serverless Function for Categories API
 * Wraps the backend categories logic
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { promises: fsp } = fs;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory - use /tmp for Vercel serverless
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../backend/data');
const categoriesFilePath = path.join(DATA_DIR, 'categories.json');
const backupFilePath = path.join(DATA_DIR, 'categories.backup.json');

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function readCategories() {
  try {
    const data = await fsp.readFile(categoriesFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading categories:', error);
    return [];
  }
}

async function writeCategories(categories) {
  try {
    await fsp.mkdir(DATA_DIR, { recursive: true });
    await fsp.writeFile(categoriesFilePath, JSON.stringify(categories, null, 2));
  } catch (error) {
    console.error('Error writing categories:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // GET /api/categories
    if (req.method === 'GET') {
      const categories = await readCategories();
      res.status(200).json({ categories });
      return;
    }

    // POST /api/categories (save)
    if (req.method === 'POST') {
      const { categories } = req.body;
      
      if (!Array.isArray(categories)) {
        res.status(400).json({ error: 'Categories must be an array' });
        return;
      }

      await writeCategories(categories);
      res.status(200).json({ message: 'Categories saved', categories });
      return;
    }

    // Unsupported method
    res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: error.message });
  }
}
