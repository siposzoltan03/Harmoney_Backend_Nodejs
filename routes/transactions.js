const {Transaction, validate} = require('../models/transaction');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const transactions = await Transaction.find().sort('name');
    res.send(transactions);
});

router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send('Invalid user.');

    const transaction = new Transaction({
        title: req.body.title,
        user: {
            _id: user._id,
            name: user.name
        },
        dueDate: Date.now(),
        amount: req.body.amount,
        frequency: req.body.frequency,
        direction: req.body.direction,
        category: req.body.category
    });
    await transaction.save();

    res.send(transaction);
});

router.put('/:id', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send('Invalid user.');

    const transaction = new Transaction({
        title: req.body.title,
        user: {
            _id: user._id,
            name: user.name
        },
        dueDate: Date.now(),
        amount: req.body.amount,
        frequency: req.body.frequency,
        direction: req.body.direction,
        category: req.body.category
    }, {new: true});

    if (!transaction) return res.status(404).send('The transaction with the given ID was not found.');

    res.send(transaction);
});

router.delete('/:id', async (req, res) => {
    const transaction = await Transaction.findByIdAndRemove(req.params.id);

    if (!transaction) return res.status(404).send('The transaction with the given ID was not found.');

    res.send(transaction);
});

router.get('/:id', async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).send('The transaction with the given ID was not found.');

    res.send(transaction);
});

module.exports = router;