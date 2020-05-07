const config = require('config');
const cors = require('cors');
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

// app.options('/api/auth', cors());
// app.use(cors({credentials: true}));
app.use(express.json());
app.use(cors({credentials: true, origin: true}));
// app.use('*',function(req, res, next) {
//   res.header('Access-Control-Allow-Methods', 'GET', 'POST', 'PUT', 'DELETE');
//   res.header("Access-Control-Allow-Headers", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   res.header('Access-Control-Allow-Headers', 'Content-Type');
//   res.header("Access-Control-Allow-Credentials", true);
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, token");
//   res.header("credentials", "true");
//   next();
// });
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));
// app.use(cors({credentials: true, origin: 'http://localhost:5001'}));
// app.options('*', cors());
app.use('/', indexRouter);
// app.use('/api/users');
app.use('/api/users', users);
app.use('/api/auth', auth);
app.use('/api/transactions', transactions);

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}...`));