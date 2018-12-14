const mongoCollections = require("../config/mongoCollections");
const songDb = mongoCollections.songCollection;
const uuid = require("node-uuid");

let exportedMethods = {

    async getSongByTitle(title) {
        //Error checking
        if (typeof title !== 'string') throw "Please provide a valid song title.";
        
        //Get song collection
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();
        
        // Search users for the specific ID
        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            if (song.name === title)
                return song;
        }

        // If user not found return message.
        return "Song not found: " + title;
    },

    async songExists(songTitle) {
        //Error checking
        if (typeof songTitle !== 'string') throw "Please provide a valid song title.";

        //Get song collection
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        //Loop through song collection
        //Check if any of the collection song titles match songTitle
        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            if (song.name === songTitle)
                return true;
        }

        return false;
    },

    async searchForSong(searchValue){
        //Empty array of found songs
        let foundSongs = [];

        //Return empty array if invaild query
        if (typeof searchValue.query !== 'string') return foundSongs;

        let searchTerm = searchValue.query;

        //Get song collection
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        //Loop through song collection
        //Check if song name, artist, album, genres, or tags include the queried string
        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            let added = false;
            if (song.name.includes(searchTerm)) {
                foundSongs.push(song);
                added = true;
            }
            else if (song.artist.includes(searchTerm)) {
                foundSongs.push(song);
                added = true;
            }
            else if (song.album.includes(searchTerm)){
                foundSongs.push(song);
                added = true;
            }

            const songGenres = song.genres;
            for (j = 0; j < songGenres.length; j++){
                let genre = songGenres[j];
                if (genre.includes(searchTerm) && added == false){
                    foundSongs.push(song);
                    added = true;
                }
            }           
            
            /* --- not in yet....
            for (j = 0; j < songTags.length; j++){
                let tag = songTags[j];
                if (tag.includes(searchTerm) && added == false){
                    foundSongs.push(song);
                    added = true;
                }
            }
            */
        }
        return foundSongs;
    },

    async getSongListByUser(userId) {
        // Error checking
        if (!userId) throw "Please provide a valid user ID to get their playlists";

        // Get playlists from database and turn all playlists to string
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        // Build a list of all of the playlists a single user has created
        let userSongs = [];

        // Search playlists for all playlists from a userId and add them to the build
        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            //if (song.userId === userId) {
                userSongs.push(song);
            //}
        }

        // If user not found return message.
        return userSongs;
    },
    
    async deleteSong(id) {
        // Error checking
        if (!id) throw "Please provide a valid ID.";

        // Get songs and remove one by id
        const songCollection = await songDb();
        const deletionInfo = await songCollection.removeOne({
            _id: id
        });

        // Else throw error message
        if(deletionInfo.deleteCount === 0) {
            throw `Could not delete song with id of ${id}`;
        }
    },
    
    async addSong(title, artist, album, genre, rating) {
        // Error checking type of input as strings
        if (typeof title !== 'string') throw "Please provide a valid song title.";
        if (typeof artist !== 'string') throw "Please provide a valid artist name.";
        if (typeof album !== 'string') throw "Please provide a valid album title.";
        if (typeof rating !== 'string') throw "Please provide a valid rating.";

        // Get song collection, generate id that is only numeric
        const songCollection = await songDb();

        // Build song object
        const newSong = {
            _id: uuid.v4(),
            name: title,
            artist: artist,
            album: album,
            rating: rating,
            genres: genre
            //Add something about userID 
        };

        // Insert new song and return its submission id 
        const newInsertInformation = await songCollection.insertOne(newSong);
        const newId = newInsertInformation.insertedId;
        return newId;
    },

    async addTag(song, tag1, tag2, tag3, tag4, tag5){
        if (typeof song !== 'string') throw 'Please provide a valid song title.';

        let tagList = [];
        tagList = checkTag(tag1);
        tagList = checkTag(tag2);
        tagList = checkTag(tag3);
        tagList = checkTag(tag4);
        tagList = checkTag(tag5);
        return tagList;
    },

    //addTag helper to check if valid string tag
    async checkTag(tagList, tag){
        if (tag !== null){
            if (typeof tag !== 'string') throw 'Please provide a valid tag';
            tagList.push(tag);
        }
        return tagList;
    },

    async updateSong(id, updatedSong) {
        // Error checking
        if (!id) throw "Please provide a valid ID.";

        // Song builder
        const updatedSongData = {};

        // Check for all song attributes and check if they are string.
        // If they exist, add them to the song builder.
        if (updatedSong.title && typeof updatedSong.title === "string") {
            updatedSongData.title = updatedSong.title;
        }

        if (updatedSong.artist && typeof updatedArtist.artist === "string") {
            updatedSongData.artist = updatedSong.artist;
        }

        if (updatedSong.album && typeof updatedSong.album === "string") {
            updatedSongData.album = updatedSong.album;
        }

        if (updatedSong.rating && typeof updatedSong.rating === "string") {
            updatedSongData.rating = updatedSong.rating;
        }

        // Build parameters for updateOne function including:
        // the updated information and
        // the song id
        let updateCommand = {
            $set: updatedSongData
        };
        const query = {
            _id: id
        };
        await songCollection.updateOne(query, updateCommand);
    }
}

module.exports = exportedMethods;