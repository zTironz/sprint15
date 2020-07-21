const usersRouter = require('express').Router();

const { getUsers, getUser } = require('../controllers/users');

usersRouter.get('/', getUsers);

usersRouter.get('/:userId', getUser);

// usersRouter.post('/', createUser);

module.exports = usersRouter;
