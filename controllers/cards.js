const Card = require('../models/card');
const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const Unauthorized = require('../errors/unauthorized');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch((err) => next(err));
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest({ message: err.message });
      }
      return err;
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Нет карточки');
      }
      if (card.owner.toString() !== req.user._id) {
        throw new Unauthorized('Недостаточно прав');
      }
      res.send({ data: card });
      card.remove();
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
};
