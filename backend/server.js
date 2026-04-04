const express = require('express');
const cors = require('cors');
const categoriesRouter = require('./routes/categories');

const app = express();
const PORT = 3001;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000']
}));
app.use(express.json());

app.use('/api/categories', categoriesRouter);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});