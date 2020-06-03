const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cors = require("cors");
const {FriendRequest} = require('../models/friendRequest');
const {User} = require('../models/user');

router.post('/add', auth, cors(), async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const requestedUser = await User.findById(req.body.friendId.toString());
    const alreadyFriends = await FriendRequest.findOne({from: currentUser._id}, {to: requestedUser._id});
    if(alreadyFriends) return res.status(400).send("You've already sent a request");
    const request = await new FriendRequest();
    request.from = currentUser._id;
    request.to = requestedUser._id;
    await request.save();
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.status(200).send(request);

});

module.exports = router;