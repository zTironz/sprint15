const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректный id' });
      }
      res.status(500).send({ message: err.message });
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const id = req.user._id;
  Card.create({ name, link, owner: id })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(400).send({ message: err.message });
      } else {
        res.status(500).send({ message: err.message });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findById(req.params.cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(404).send({ message: 'Нет карточки' });
      } if (card.owner._id.toString() === req.user._id) {
        return card.remove(req.params.cardId).then(() => res.status(200).send({ message: 'Карточка удалена' }));
      } res.status(403).send({ message: 'Недостаточно прав' });
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'CastError') {
        return res.status(400).send({ message: 'Некорректный id' });
      }
      res.status(500).send({ message: err.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
};
