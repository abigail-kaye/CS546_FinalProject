const mongoCollections = require("../config/mongoCollections");
const songDb = mongoCollections.songCollection;

let exportedMethods = {
    async getSongByTitle(title) {
        if (typeof title !== 'string') throw "Please provide a valid song title.";
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        // Search users for the specific ID
        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            if (song.title === title) {
                return song;
            }
        }

        // If user not found return message.
        return "Song not found: " + title;
    },
    async songExists(songTitle) {
        if (typeof songTitle !== 'string') throw "Please provide a valid song title.";

        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        for (i = 0; i < songs.length; i++) {
            let song = songs[i];
            if (song.name === songTitle) {
                return true;
            }
        }

        return false;
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
    async addSong(title, artist, album, rating) {
        // Error checking type of input as strings
        if (typeof title !== 'string') throw "Please provide a valid song title.";
        if (typeof artist !== 'string') throw "Please provide a valid artist name.";
        if (typeof album !== 'string') throw "Please provide a valid album title.";
        if (typeof rating !== 'string') throw "Please provide a valid rating.";

        // Get song collection, generate id that is only numeric
        const songCollection = await songDb();
        const generateId = Math.floor(Math.random() * 100000000) + 100;
        const stringId = generateId.toString();

        // Build song object
        const newSong = {
            _id: stringId,
            title: title,
            artist: artist,
            album: album,
            rating: rating
        };

        // Insert new song and return its submission id 
        const newInsertInformation = await songCollection.insertOne(newSong);
        const newId = newInsertInformation.insertedId;
        return newId;
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