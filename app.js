

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
    if(typeof req.cookies.AuthCookie !== 'undefined') 
        res.redirect('/songList');
    else 
        return next();
}

function protectPrivateRoute(req, res, next) {
    if(typeof req.cookies.AuthCookie !== 'undefined')
        return next();
    else
        res.status(403).send("User not logged in.");
}

//Automatically redirect to home page (song list page)
app.get('/', function (req, res) {
    if(typeof req.cookies.AuthCookie === "undefined") {
        res.redirect('/login');
    }else {
        res.redirect('/songList');
    }
});

//Create login page
app.get('/login', noDuplicateLogin, function (req, res) {
    res.render('pages/login');
})

//Redirect to song list page if authenticated user/session 
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

//Create song list page for user
app.get('/songList', protectPrivateRoute, function (req, res) {
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        const userSongs = await songs.getSongListByUser(user._id);
        res.render('pages/songList', {
            songs: userSongs,
            layout: 'loggedin.handlebars'
        });
    });
});

//Redirect to song list page
app.post('/songList', function (req, res) {
    res.redirect('/songList');
});

//Create search result page based search results
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

//Redirect to song list page
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
        res.render('pages/playlists', {
            playlists: usersPlaylists,
            layout: 'loggedin.handlebars'
        });
    });
});

//Redirect to view all playlists
app.post('/playlists', function(req,res) {
    res.redirect('/playlists');
})

//Create page to add another playlist
app.get('/addplaylist', protectPrivateRoute, function (req,res) {
    res.render('pages/addplaylist', {
        layout: 'loggedin.handlebars'
    });
})

//Redirect to playlist page after a new playlist has been created
app.post('/addplaylist', protectPrivateRoute, function (req,res) {
    let playlistName = req.body.name;
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        await playlists.addPlaylist(user._id,playlistName);
        res.redirect('/playlists');
    });
})

//Stay on same page after deleting a playlist
app.get('/deleteplaylist/:playlistId', protectPrivateRoute, async function (req, res) {
    users.getUserById(req.cookies.AuthCookie).then(async function (user){
        let allPlaylists = await playlists.getPlaylistsByUserId(user._id);
        let toDelete = allPlaylists[req.params.playlistId];
        playlists.deletePlaylist(toDelete._id);
        res.redirect('back')
    })
})

//Create page for adding a song to a playlist
app.get('/addsong/:playlistId', protectPrivateRoute, async function(req, res) {
    const playlist = await playlists.getPlaylistById(req.params.playlistId);
    res.render('pages/addsong', {
        playlist: playlist,
        layout: 'loggedin.handlebars'
    });
});

//Create page based on if song was added or not
app.post('/addsong/:playlistId', protectPrivateRoute, async function (req, res) {
    if(await songs.songExists(req.body.title)) {
        let updatedPlaylist = await playlists.addSongToPlaylist(req.params.playlistId, req.body.title);
        res.render('pages/addsong', {
            playlist: updatedPlaylist,
            message: "Song added!",
            layout: 'loggedin.handlebars'
        });
        // But need user id
    }else {
        res.render('pages/addsong', {
            playlist: await playlists.getPlaylistById(req.params.playlistId),
            message: "That song does not exist in the database.",
            layout: 'loggedin.handlebars'
        });
    }
})

//Stay on same page after deleting a song from a playlist
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

//Redirect to song info page
app.post('/searchResults/viewSong/:songName', protectPrivateRoute, async function (req, res){
    let songName = req.params.songName;
    let songInfo = await songs.getSongByTitle(songName);
    res.render('pages/viewOneSong',{
        song: songInfo,
        layout: 'loggedin.handlebars'
    });
})

//Populate song info page
app.post('/viewSong/:songName', protectPrivateRoute, async function(req, res) {
    let songName = req.params.songName;
    let songInfo = await songs.getSongByTitle(songName);
    res.render('pages/viewOneSong',{
        song: songInfo,
        layout: 'loggedin.handlebars'
    });
})

// Post the information from the page to create a song in the database
app.post('/updatesong', protectPrivateRoute, async function(req, res) {
    let genres = [];
    if(!(req.body.genre1 == 'Choose')){
        genres.push(req.body.genre1);
    }
    if(!(req.body.genre2 == 'Choose')){
        genres.push(req.body.genre2);
    }
    
    const newSong = {
        name: req.body.title,
        artist: req.body.artist,
        album: req.body.album,
        rating: req.body.rating,
        genres: genres
    };
    
    await songs.updateSong(req.body.id,newSong);
    res.redirect('/songList');
})

// Navigate to the page where you can add a song to the database
app.get('/createSong', protectPrivateRoute, async function(req, res) {
    res.render('pages/createSong', {
        layout: 'loggedin.handlebars'
    })
})

app.post('/createSong', protectPrivateRoute, async function(req, res) {
         let genres = [];
        if(!(req.body.genre1 == 'Choose')){
            genres.push(req.body.genre1);
        }
        if(!(req.body.genre2 == 'Choose')){
            genres.push(req.body.genre2);
        }
        await songs.addSong(req.body.title, req.body.artist, req.body.album, genres, req.body.rating);
        res.redirect('/songList');
    })
//Create page to edit song
app.get('/editSong/:song', protectPrivateRoute, async function(req, res) {
    let songName = req.params.song;
    let songInfo = await songs.getSongByTitle(songName);
    res.render('pages/editSong', {
        song: songInfo,
        layout: 'loggedin.handlebars'
    })
})

//
app.get('/deleteSong/:songName', protectPrivateRoute, async function(req, res) {
    let songName = req.params.songName;
    let song  = await songs.getSongByTitle(songName);
    let songId = song._id; 
    users.getUserById(req.cookies.AuthCookie).then( async function (user) {
        let allUserPlaylists = playlists.getPlaylistsByUserId(user._id);
        for (i = 0; i<allUserPlaylists.length; i++){
            let playlistId = allUserPlaylists[i]._id;
            allUserPlaylists[i] = await playlists.deleteSongToPlaylist(playlistId,songName);
        }
    });
    // console.log(song);
    await songs.deleteSong(songId);
    res.redirect('/songList');
})

//Redirect to login screen after logging out
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