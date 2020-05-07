const Joi = require('joi');
const bcrypt = require('bcrypt');
const _ = require('lodash');
const {User} = require('../models/user');
const mongoose = require('mongoose');
const express = require('express');
const router = express.Router(undefined);
const cors = require('cors');
const auth = require('../middleware/auth');

// login
router.post('/', async (req, res) => {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    let user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if (!validPassword) return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    const result = {
        'user': user,
        'token': token
    };
    res.send(result);
});

router.post('/logout', auth, async (req, res) =>{
    // const {error} = validate(req.body);
    // if (error) return res.status(400).send(error.details[0].message);

    if (req.user._id !== req.body._id) {
        return res.status(401).send('Authorization failed')
    }
    return res.status(204).send("Logged out!");

})

function validate(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    };

    return Joi.validate(req, schema);
}

module.exports = router;
