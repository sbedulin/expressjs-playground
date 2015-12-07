var express = require('express');
var fs = require('fs');
var helpers = require('./helpers');

var User = require('./db').User;

var router = express.Router({
    mergeParams: true
});

router.use(function (req, res, next) {
    console.log(req.method, 'for', req.params.username, ' at ' + req.path);
    next();
});

router
    //.get('/', helpers.verifyUser, function (req, res) {
    .get('/', function (req, res) { // to check error handling
        var username = req.params.username;

        // 1. File-based DB
        // var user = helpers.getUser(username);

        // 2. MongoDB
        var user = User.findOne({ username: username }, function (err, user) {
            res.render('user', {
                user: user,
                address: user.location
            });
        });
    })
    .put('/', function (req, res) {
        var username = req.params.username;

        // 1. File-based DB
        // var user = helpers.getUser(username);
        // user.location = req.body;
        // helpers.saveUser(username, user);

        // 2. MongoDB
        User.findOne({username: username}, function (err, user) {
            if (err) console.error(err);

            user.name.full = req.body.name;
            user.location = req.body.location;
            user.save(function () {
                res.end();
            });
        });
    })
    .delete('/', function (req, res) {
        var fp = helpers.getUserFilePath(req.params.username);
        fs.unlinkSync(fp); // delete the file
        res.sendStatus(200);
    });

// Error handling middleware, should go after route
router.use(function (err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Something broke!')
});

module.exports = router;