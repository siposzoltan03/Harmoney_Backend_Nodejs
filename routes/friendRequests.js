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
    if (alreadyFriends) return res.status(400).send("You've already sent a request");
    const request = await new FriendRequest();
    request.from = currentUser._id;
    request.to = requestedUser._id;
    await request.save();
    await addUnconfirmedFriend(req, res, requestedUser);
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
        for (const friendId of friendObject) {
            const friend = friendId;
            friends.push(friend);
        }
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

async function addUnconfirmedFriend(req, res, requestedUser) {
    const currentUser = await User.findById(req.user._id);
    // const friendToAdd = await User.findById(req.params.id);
    if (currentUser.friends.forEach(friends => friends.forEach(friend => friend.friend.id === requestedUser))) return res.status(400).send("You are already friends");
    const result = await User.update({_id: currentUser._id}, {
        $push: {
            friends: {
                friend: {
                    id: requestedUser,
                    confirmed: false
                }
            }
        }
    });
    if (!result) return res.status(400).send('No such document');
    const result2 = await User.update({_id: requestedUser._id}, {
        $push: {
            friends: {
                friend: {
                    id: currentUser,
                    confirmed: false
                }
            }
        }
    });
    if (!result2) return res.status(400).send('No such document');
    res.status(200).send('Friend added successfully');
}

router.patch('/:id', auth, async (req, res) => {
    const currentUser = await User.findById(req.user._id);
    const friendToAdd = await User.findById(req.params.id);
    if (currentUser.friends.forEach(friends => friends.forEach(friend => friend.friend.id === friendToAdd))) return res.status(400).send("You are already friends");
    const result = await User.update({_id: currentUser._id}, {
        friends: {
            friend: {
                id: friendToAdd,
                confirmed: true
            }
        }
    }, printError);
    if (!result) return res.status(400).send('No such document');
    const result2 = await User.update({_id: friendToAdd._id}, {
        friends: {
            friend: {
                id: currentUser,
                confirmed: true
            }
        }
    });
    if (!result2) return res.status(400).send('No such document');
    res.status(200).send('Friend added successfully');


});

function printError(err, result) {
    console.log(err, result);
}

module.exports = router;