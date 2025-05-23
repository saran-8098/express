require('dotenv').config();
require('./config/db'); // Make sure path to your db.js is correct

const express = require('express');
const app = express();
const port = 5000;

const UserRouter = require('./api/user'); // Make sure path is correct

app.use(express.json());

app.use('/user', UserRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
