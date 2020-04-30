const config = require('config');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: "Email is required",
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: "Password is required",
        minlength: 5,
        maxlength: 1024
    },
    isAdmin: Boolean,
    firstName: {
        type: String,
        minlength: 3,
        maxlength: 30
    },
    lastName: {
        type: String,
        minlength: 3,
        maxlength: 30
    }
});

userSchema.methods.generateAuthToken = function() {
    const token = jwt.sign({ _id: this._id, isAdmin: this.isAdmin }, process.env.HARMONEY_SECRET_KEY);
    return token;
};

const User = mongoose.model('User', userSchema);

function validateUser(user) {
    const schema = {
        firstName: Joi.string().min(3).max(30).required(),
        lastName: Joi.string().min(3).max(30).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(user, schema);
}

exports.User = User;
exports.validate = validateUser;