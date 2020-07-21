const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

module.exports.getUsers = (req, res) => {
  User
    .find({})
    .then((users) => res.send({ users }))
    .catch((err) => res.status(500).send({ message: err.massage }));
};

module.exports.getUser = (req, res) => {
  User
    .findById(req.params.userId)
    .then((user) => {
      if (!user) {
        res.status(404).send({ message: 'Такого пользователя нет' });
      } else {
        res.send({ user });
      }
    })
    .catch(() => res.status(400).send({ message: 'Нет пользователя с таким id' }));
};
module.exports.createUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!password) {
    return res.status(400).send({ message: 'Пароль не задан' });
  }
  if (password.length < 8) {
    return res.status(400).send({ message: 'Пароль должен быть не менее 8 символов' });
  } return bcrypt.hash(password, 10)
    .then((hash) => User.create({
      email,
      password: hash,
      name,
      about,
      avatar,
    }))
    .then((user) => res.send({
      data: {
        name: user.name,
        about: user.about,
        avatar: user.avatar,
        email: user.email,
      },
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else {
        res.status(409).send({ message: 'Данный Email уже используется' });
      }
    });
};

module.exports.login = (req, res) => {
  const { email, password } = req.body;
  if (password) {
    return User
      .findUserByCredentials(email, password)
      .then((userObj) => {
        const token = jwt.sign({ _id: userObj._id }, NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret', { expiresIn: '7d' });
        res.send({ token });
      })
      .catch((err) => {
        res.status(401).send({ message: err.message });
      });
  }
  return res.status(400).send({ message: 'Необходимо ввести пароль' });
};
