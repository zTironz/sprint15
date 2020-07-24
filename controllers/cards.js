const Card = require('../models/card');
const BadRequest = require('../errors/bad-request');
const NotFoundError = require('../errors/not-found-err');
const Unauthorized = require('../errors/unauthorized');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequest({ message: 'Некорректный id' });
      }
      res.status(500).send({ message: err.message });
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const id = req.user._id;
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequest({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
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
