const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cardsRoute = require('./routes/cards');
const usersRoute = require('./routes/users');
const { login, createUser } = require('./controllers/users');
require('dotenv').config();
const { auth } = require('./middlewares/auth');

const { PORT = 3000 } = process.env;

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

app.post('/signup', createUser);
app.post('/signin', login);
app.use('/cards', auth, cardsRoute);
app.use('/users', auth, usersRoute);
app.all('*', (req, res) => {
  res.status(404).send({ message: 'Запрашиваемый ресурс не найден' });
});
app.listen(PORT);
