

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
        res.redirect('/songList');
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
        res.redirect('/songList');
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
                res.redirect('/songList');
            } else {
                res.redirect('/login');
            }
        });
    });
});

app.get('/songList', protectPrivateRoute, function (req, res) {
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        const userSongs = await songs.getSongListByUser(user._id);
        //console.log(userSongs);
        res.render('pages/songList', {
            songs: userSongs,
            layout: 'loggedin.handlebars'
        });
    });
});

app.post('/songList', function (req, res) {
    res.redirect('/songList');
});

app.get('/searchResults', protectPrivateRoute, function (req, res) {
   users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        const userSongs = await songs.searchForSong(req.query);
        if (userSongs.length == 0){
            res.render('pages/searchResults', {
                message: "No results found for:",
                search: req,
                songs: userSongs,
                layout: 'loggedin.handlebars'
            });
        } else{
            res.render('pages/searchResults', {
                message: "Search results for: ",
                search: req,
                songs: userSongs,
                layout: 'loggedin.handlebars'
            });
        }
    });
    
});

app.post('/searchResults', function (req,res) {
    res.redirect('/songList');
})

// There are two different layouts one for when a user is not logged in
// and a layout for when a user IS logged in. When navigating to a page
// where the user is logged in, you must specifiy the layout to use. In
// this case it is loggedin.handlebars
app.get('/playlists', protectPrivateRoute, function (req, res) {
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        const usersPlaylists = await playlists.getPlaylistsByUserId(user._id);
        //console.log(usersPlaylists);
        res.render('pages/playlists', {
            playlists: usersPlaylists,
            layout: 'loggedin.handlebars'
        });
    });
});

app.post('/playlists', function(req,res) {
    res.redirect('/playlists');
})

app.get('/addplaylist', protectPrivateRoute, function (req,res) {
    res.render('pages/addplaylist', {
        layout: 'loggedin.handlebars'
    });
})

app.post('/addplaylist', protectPrivateRoute, function (req,res) {
    let playlistName = req.body.name;
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        await playlists.addPlaylist(user._id,playlistName);
        res.redirect('/playlists');
    });
})

app.get('/deleteplaylist/:playlistId', protectPrivateRoute, async function (req, res) {
    
    users.getUserById(req.cookies.AuthCookie).then(async function (user){
        let allPlaylists = await playlists.getPlaylistsByUserId(user._id);
        let toDelete = allPlaylists[req.params.playlistId];
        playlists.deletePlaylist(toDelete._id);
        res.redirect('back')
    })
})

app.get('/addsong/:playlistId', protectPrivateRoute, async function(req, res) {
    const playlist = await playlists.getPlaylistById(req.params.playlistId);
    res.render('pages/addsong', {
        playlist: playlist,
        layout: 'loggedin.handlebars'
    });
});

app.post('/addsong/:playlistId', protectPrivateRoute, async function (req, res) {
    if(await songs.songExists(req.body.title)) {
        let updatedPlaylist = await playlists.addSongToPlaylist(req.params.playlistId, req.body.title);
        // console.log(updatedPlaylist);
        res.render('pages/addsong', {
            playlist: updatedPlaylist,
            message: "Song added!",
            layout: 'loggedin.handlebars'
        });
        // res.redirect("/playlists");
        // But need user id
    }else {
        res.render('pages/addsong', {
            playlist: await playlists.getPlaylistById(req.params.playlistId),
            message: "That song does not exist in the database.",
            layout: 'loggedin.handlebars'
        });
    }
})

app.get('/playlists/:playlistId/:songName', protectPrivateRoute, async function(req, res) {
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
    const usersPlaylists = await playlists.getPlaylistsByUserId(user._id);
    const playlist = usersPlaylists[req.params.playlistId];
    const songName = playlist.songs[req.params.songName];
    const updatedPlaylist = await playlists.deleteSongToPlaylist(playlist._id,songName);
    usersPlaylists[req.params.playlistId] = updatedPlaylist;
    res.redirect('back')
    });
});

app.post('/playlists/:playlistId/:songName', protectPrivateRoute, async function(req, res) {
        res.redirect('/playlists');
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