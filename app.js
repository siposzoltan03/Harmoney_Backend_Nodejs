const config = require('config');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const mongoose = require('mongoose');
// const genres = require('./routes/genres');
// const customers = require('./routes/customers');
// const movies = require('./routes/movies');
// const rentals = require('./routes/rentals');
const auth = require('./routes/auth');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const users = require('./routes/users');
const transactions = require('./routes/transactions');

const app = express();


if (!process.env.HARMONEY_SECRET_KEY) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined.');
  process.exit(1);
}

mongoose.connect('mongodb://localhost/harmoney', { useNewUrlParser: true , useUnifiedTopology: true} )
    .then(() => console.log('Connected to MongoDB...'))
    .catch(err => console.error('Could not connect to MongoDB...', err));

app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/transactions', transactions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));