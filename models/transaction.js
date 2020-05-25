const Joi = require('joi');
const mongoose = require('mongoose');
const {User, userSchema} = require('./user');

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 255
    },
    dueDate: {
        type: Date,
        default: Date.now
    },
    amount: {
        type: Number,
        required: true,
        min: 2,
        max: 999999999
    },
    frequency: {
        type: Number,
        enum: [0, 1, 2, 3, 4],
        required: true,
        default: 3
    },
    direction: {
        type: Number,
        enum: [0, 1],
        required: true,
        default: 1
    },
    category: {
        type: Number,
        enum: [0, 1, 2, 3, 4, 5, 6, 7 ,8 ,9 ,10 ,11 , 12, 13, 14, 15, 16, 17],
        required: true,
        default: 5
    },
    user: {
        type: mongoose.Schema.Types.ObjectID,
        ref: User,
    }
}));

function validateTransaction(transaction) {
    const schema = {
        userId: Joi.objectId().required(),
    };

    return Joi.validate(transaction, schema, {allowUnknown: true});
}

exports.Transaction = Transaction;
exports.validate = validateTransaction;