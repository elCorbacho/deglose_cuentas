import express from 'express';
import cors from 'cors';
import categoriesRouter from './routes/categories.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? ['https://tu-app.vercel.app', 'https://tu-app.railway.app']
    : ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

app.use('/api/categories', categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});