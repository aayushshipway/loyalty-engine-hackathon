require('dotenv').config();
const express = require('express');
const app = express();
const routes = require('./routes/index');
const cors = require('cors');

app.use(cors({
  origin: process.env.CORS_ALLOWED_DOMAINS ? process.env.CORS_ALLOWED_DOMAINS.split(',') : [],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
}));

const PORT = process.env.PORT;

app.use(express.json());

// Mount routes
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on PORT: ${PORT}`);
});
