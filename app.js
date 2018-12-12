

const express = require('express');
//const session = require('express-session');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const cookieParser = require('cookie-parser');
const exphbs = require('express-handlebars');
const users = require('./data/users');
const songs = require('./data/songs');
const playlists = require('./data/playlists');
const app = express();

// initialize cookie-parser to allow us access the cookies stored in the browser
app.use(bodyParser.json());
app.use(cookieParser());
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));
app.set('view engine', 'handlebars');

// initialize body-parser to parse incoming parameters requests to req.body 
app.use(bodyParser.urlencoded({
    extended: true
}));

function noDuplicateLogin(req, res, next) {
    if(typeof req.cookies.AuthCookie !== 'undefined') {
        res.redirect('/playlists');
    }else {
        return next();
    }
}

function protectPrivateRoute(req, res, next) {
    if(typeof req.cookies.AuthCookie !== 'undefined') {
        return next();
    }else {
        res.status(403).send("User not logged in.");
    }
}

app.get('/', function (req, res) {
    if(typeof req.cookies.AuthCookie === "undefined") {
        res.redirect('/login');
    }else {
        res.redirect('/playlists');
    }
});

app.get('/login', noDuplicateLogin, function (req, res) {
    res.render('pages/login');
})

app.post('/login', function (req, res) {
    users.getUserByName(req.body.username).then(function (user) {
        bcrypt.compare(req.body.password, user.hashedPassword, function (err, response) {
            if (response) {
                res.cookie("AuthCookie", user._id);
                res.redirect('/playlists');
            } else {
                res.redirect('/login');
            }
        });
    });
});

// There are two different layouts one for when a user is not logged in
// and a layout for when a user IS logged in. When navigating to a page
// where the user is logged in, you must specifiy the layout to use. In
// this case it is loggedin.handlebars
app.get('/playlists', protectPrivateRoute, function (req, res) {
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        const usersPlaylists = await playlists.getPlaylistsByUserId(user._id);
        res.render('pages/playlists', {
            playlists: usersPlaylists,
            layout: 'loggedin.handlebars'
        });
    });
})

app.get('/addsong/:playlistId', protectPrivateRoute, async function(req, res) {
    const playlist = await playlists.getPlaylistById(req.params.playlistId);
    res.render('pages/addsong', {
        playlist: playlist,
        layout: 'loggedin.handlebars'
    });
});

app.post('/addsong/:playlistId', protectPrivateRoute, async function (req, res) {
    console.log(req.body.title);
    if(await songs.songExists(req.body.title)) {
        let songtitle = await songs.getSongByTitle(req.body.title).title;
        await playlists.addSongToPlaylist(req.params.playlistId, songtitle);
        // res.redirect("/playlists");
        // But need user id
    }else {
        res.render('pages/addsong', {
            playlist: await playlists.getPlaylistById(req.params.playlistId),
            message: "That song does not exist in the database.",
            layout: 'loggedin.handlebars'
        });
    }
    // await playlists.addSongToPlaylist(req.params.playlistId, req.body.title)
})

app.get('/logout', function (req, res) {
    res.clearCookie("AuthCookie");
    res.redirect('/');
})

app.listen(3000, function () {
    console.log("Your server is now listening on port 3000!");
    console.log("To access it, navigate to http://localhost:3000");

    if (process && process.send) process.send({
        done: true}); // ADD THIS LINE
});