// mongoConnection will allow you to access mongoCollections stored on mlab.com
const MongoClient = require('mongodb').MongoClient;
const settings = require("./settings");
const mongoConfig = settings.mongoConfig;

// Build connection string from config/settings.json
let fullMongoUrl = `${mongoConfig.serverUrl}${mongoConfig.database}`;
let _connection = undefined;

// Connect to the database
let connectDb = async () => {
    if (!_connection) {
        _connection = await MongoClient.connect(fullMongoUrl);
    }

    return _connection;
};

module.exports = connectDb;