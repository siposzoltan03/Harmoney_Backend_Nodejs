const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const cors = require("cors");
const {FriendRequest} = require('../models/friendRequest');
const {User} = require('../models/user');

router.post('/add', auth, cors(), async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const requestedUser = await User.findById(req.body.friendId.toString());
    // const alreadyFriends = await FriendRequest.findOne({from: currentUser._id}, {to: requestedUser._id});
    // if (alreadyFriends) return res.status(400).send("You've already sent a request");
    const request = await new FriendRequest();
    request.from = currentUser._id;
    request.to = requestedUser._id;
    await request.save();
    // await addUnconfirmedFriend(req, res);
    if (currentUser.friends.forEach((friend => friend.id === requestedUser))) return res.status(400).send("You are already friends");
    const result = await User.findOneAndUpdate({_id: currentUser._id}, {
        $push: {
            friends: {
                id: requestedUser,
                confirmed: false
            }
        }
    });
    if (!result) return res.status(400).send('No such document');
    const result2 = await User.findOneAndUpdate({_id: requestedUser._id}, {
        $push: {
            friends: {
                id: currentUser,
                confirmed: false
            }
        }
    });
    if (!result2) return res.status(400).send('No such document');
    // res.status(200).send('Friend added successfully');

    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
    res.status(200).send(request);

});
// get notifications
router.get('/', auth, async (req, res) => {
    let usersByNotifications = [];
    const currentUser = await User.findById(req.user._id);
    const notifications = await FriendRequest.find({to: currentUser._id});
    for (const notification of notifications) {
        usersByNotifications.push({user: await User.findById(notification.from), seen: notification.seen});
    }
    res.status(200).send({
        usersByNotifications: usersByNotifications,
        count: usersByNotifications.filter(notification => notification.seen === false).length
    });

});

router.patch('/seen', auth, async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    // const notificationsOfCurrentUser = await FriendRequest.find({to: currentUser._id});
    // for (const notification of notificationsOfCurrentUser) {
    await FriendRequest.updateMany({to: currentUser._id}, {seen: true});
    // }
    res.status(200).send('Request seen');

});

router.get('/getFriends', auth, async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const friendsObjects = currentUser.friends;
    const friends = [];
    for (const friendObject of friendsObjects) {
            const friend = friendObject;
            friends.push(friend);
    }
    res.status(200).send(friends);
});

router.delete('/:id', auth, async (req, res) => {
    const userTo = await User.findById(req.user._id);
    const userFrom = await User.findById(req.params.id);
    const result = await FriendRequest.findOneAndRemove({to: userTo._id, from: userFrom._id});
    if (!result) return res.status(400).send("No such document");
    res.status(200).send("Document deleted");
});

router.patch('/:id', auth, async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const friendToAdd = await User.findById(req.params.id);
    if (currentUser.friends.forEach((friend => friend.id === friendToAdd))) return res.status(400).send("You are already friends");
    const result = await User.findOneAndUpdate({_id: friendToAdd._id}, {
        $set:{'friends.$[friend].confirmed':  true}
    },{new:true,arrayFilters: [{'friend.id._id': currentUser._id}  ]}, printError);
    if (!result) return res.status(400).send('No such document');
    const result2 = await User.findOneAndUpdate({_id: currentUser._id}, {
        $set:{'friends.$[friend].confirmed':  true}
    },{arrayFilters: [{'friend.id._id': friendToAdd._id}  ], new: true}, printError);
    if (!result2) return res.status(400).send('No such document');
    res.status(200).send('Friend added successfully');


});

function printError(err, result) {
    console.log(err, result);
}

module.exports = router;