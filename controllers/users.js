const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const UniqueError = require('../errors/unique-error');
const BadRequest = require('../errors/bad-request');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res, next) => {
  User
    .find({})
    .then((users) => res.send({ users }))
    .catch(next);
};

module.exports.getUser = (req, res, next) => {
  User
    .findById(req.params.userId)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такого пользователя нет');
      } else {
        res.send({ user });
      }
    })
    .catch(next);
};

module.exports.createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  const regExp = /(?=^.{8,}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s).*/;
  if (!password) {
    throw new BadRequest('Пароль не задан');
  }
  if (!regExp.test(password)) {
    throw new BadRequest('Пароль должен быть не менее 8 символов и содержать цифры и латинские буквы');
  }
  bcrypt.hash(req.body.password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res.send({
      name: user.name, about: user.about, avatar: user.avatar, email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new UniqueError(`Данные некорректны: ${err.message}`));
      } else {
        next(new UniqueError({ message: 'Данный Email уже используется' }));
      }
    });
};

module.exports.login = (req, res, next) => {
  const { email, password } = req.body;
  if (password) {
    return User
      .findUserByCredentials(email, password)
      .then((userObj) => {
        const token = jwt.sign({ _id: userObj._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
      })
      .catch(next);
  }
  throw new BadRequest('Необходимо ввести пароль');
};

console.log('hello');
