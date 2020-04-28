const Joi = require('joi');
const mongoose = require('mongoose');
const {userSchema} = require('./user');

const Transaction = mongoose.model('Transaction', new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 5,
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
        max: 20
    },
    frequency: {
        type: String,
        enum: ["Daily", "Weekly", "Monthly", "Yearly"],
        required: true,
        default: "Monthly"
    },
    direction: {
        type: String,
        enum: ["Income","Expenditure"],
        required: true,
        default: "Expenditure"
    },
    category: {
        type: String,
        enum: ["Education",
            "Entertainment",
            "Extra",
            "Groceries",
            "Health",
            "Household",
            "Insurance",
            "Investment",
            "Kids",
            "Other",
            "Pets",
            "Sport",
            "Transportation",
            "Gift",
            "Heritage",
            "Increment",
            "Prize",
            "Salary"],
        required: true,
        default: "Household"
    },
    genre: {
        type: userSchema,
        required: true
    },
}));

function validateTransaction(transaction) {
    const schema = {
        userId: Joi.objectId().required(),
    };

    return Joi.validate(transaction, schema);
}

exports.Transaction = Transaction;
exports.validate = validateTransaction;