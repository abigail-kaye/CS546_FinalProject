// Collections come from mlab.com and are imported via the mongoConnection
const dbConnection = require("./mongoConnection");

const getCollectionFn = collection => {
    let _col = undefined;

    return async () => {
        if(!_col) {
            // Connect to db and get the specified collection
            const db = await dbConnection();
            _col = await db.collection(collection);
        }

        return _col;
    };
};

// Functions to allow you to get a specific collection from the database
module.exports = {
    userCollection: getCollectionFn('users'),
    songCollection: getCollectionFn('songs'),
    playlistCollection: getCollectionFn('playlists')
};