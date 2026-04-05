import express from 'express';
import cors from 'cors';
import categoriesRouter from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 3001;

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? [FRONTEND_URL]
    : ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:5173']
}));
app.use(express.json());

app.use('/api/categories', categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});