const mongoCollections = require("../config/mongoCollections");
const playlistDb = mongoCollections.playlistCollection;
const songs = require('./songs');

let exportedMethods = {
    async getPlaylistById(id) {
        // Error checking
        if (!id) throw "Please provide a valid playlist ID";

        // Get playlists from database and turn all playlists to string
        const playlistCol = await playlistDb();
        const playlists = await playlistCol.find().toArray();

        // Search playlists for the specific ID
        for (i = 0; i < playlists.length; i++) {
            let playlist = playlists[i];
            if (playlist._id === id) {
                return playlist;
            }
        }

        // If playlist not found return message.
        return "Playlist not found: " + id;
    },
    async getPlaylistsByUserId(userId) {
        // Error checking
        if (!userId) throw "Please provide a valid user ID to get their playlists";

        // Get playlists from database and turn all playlists to string
        const playlistCol = await playlistDb();
        const playlists = await playlistCol.find().toArray();

        // Build a list of all of the playlists a single user has created
        let usersPlaylists = [];

        // Search playlists for all playlists from a userId and add them to the build
        for (i = 0; i < playlists.length; i++) {
            let playlist = playlists[i];
            if (playlist.userId === userId) {
                usersPlaylists.push(playlist);
            }
        }

        // If user not found return message.
        return usersPlaylists;
    },
    async deletePlaylist(id) {
        // Error checking
        if (!id) throw "Please provide a valid ID.";
        // Get playlists and remove one by id
        const playlistCollection = await playlistDb();
        const deletionInfo = await playlistCollection.removeOne({
            _id: id
        });
        // Else throw error message
        if(deletionInfo.deleteCount === 0) {
            throw `Could not delete playlist with id of ${id}`;
        }
    },
    // Add a playlist with no songs. Songs will be added via the add song button on the
    // playlists.handlebars page
    async addPlaylist(userid, title) {
        // Error checking type of input as strings
        if (typeof userid !== 'string') throw "Please provide a valid userid.";
        if (typeof title !== 'string') throw "Please provide a valid playlist title.";

        // Get song collection, generate id that is only numeric
        const playlistCollection = await playlistDb();
        const generateId = Math.floor(Math.random() * 100000000) + 100;
        const stringId = generateId.toString();

        // Build song object
        const newPlaylist = {
            _id: stringId,
            userId: userId,
            title: title
        };

        // Insert new song and return its submission id 
        const newInsertInformation = await playlistCollection.insertOne(newPlaylist);
        const newId = newInsertInformation.insertedId;
        return newId;
    },
    async addSongToPlaylist(playlistId, songTitle) {
        const playlistCollection = await playlistDb();
        // const playlist = await this.getPlaylistById(playlistId);
        // const songs = playlist.songs;

        let newSongList = [];

        // songs.foreach(function (element) {
        //     newSongList.push(element);
        // });

        newSongList.push(songTitle);

        const updatedPlaylistData = { "songs": newSongList };

        let updateCommand = {
            $set: updatedPlaylistData
        };

        const query = {
            _id: playlistId
        }
        await playlistCollection.updateOne(query, updateCommand);
    },
    async deleteSongToPlaylist(playlistId, songId) {
        // Get playlist by id
        // removeOne function based on songId

    }
}

module.exports = exportedMethods;