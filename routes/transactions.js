const {Transaction, validate} = require('../models/transaction');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const router = express.Router();
const auth = require('../middleware/auth');

router.get('/', auth, cors(), async (req, res) => {
    let transactions = await Transaction.find().sort('dueDate');
    transactions = transactions.filter(transaction => transaction.user._id.toString() === req.user._id);
    transactions = transactions.reverse();
    res.send(transactions);
});

router.post('/',auth, async (req, res) => {
    const body = req.body;
    body.userId = req.user._id;
    const { error } = validate(body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(body.userId);
    if (!user) return res.status(400).send('Invalid user.');

    const transaction = new Transaction({
        title: body.title,
        user: {
            _id: user._id,
            name: user.name
        },
        dueDate: body.dueDate,
        amount: body.amount,
        frequency: body.frequency,
        direction: body.direction,
        category: body.category
    });
    await transaction.save();

    res.send(transaction);
});

router.put('/:id',auth, async (req, res) => {
    req.body.userId = req.user._id;
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const user = await User.findById(req.body.userId);
    if (!user) return res.status(400).send('Invalid user.');

    const newTransaction = new Transaction({
        _id: req.body.id,
        title: req.body.title,
        user: {
            _id: user._id,
            name: user.name
        },
        dueDate: req.body.dueDate,
        amount: req.body.amount,
        frequency: req.body.frequency,
        direction: req.body.direction,
        category: req.body.category
    }, {new: true});

    if (!newTransaction) return res.status(404).send('The transaction with the given ID was not found.');

    const transaction = await Transaction.findByIdAndUpdate(newTransaction._id, newTransaction);
    res.send(transaction);
});

router.delete('/:id',auth, async (req, res) => {
    // const oldData = await Transaction.findById(req.params.id.toString());
    const transaction = await Transaction.findByIdAndRemove(req.params.id.toString());

    if (!transaction) return res.status(404).send('The transaction with the given ID was not found.');

    res.send(transaction);
});

router.get('/:id', async (req, res) => {
    const transaction = await Transaction.findById(req.params.id);

    if (!transaction) return res.status(404).send('The transaction with the given ID was not found.');

    res.send(transaction);
});

module.exports = router;