const mongoCollections = require("../config/mongoCollections");
const userDb = mongoCollections.userCollection;

let exportedMethods = {
    async getUserById(id) {
        // Error checking
        if (!id) throw "Please provide a valid ID";

        // Get users from database and turn all users to string
        const userCol = await userDb();
        const users = await userCol.find().toArray();

        // Search users for the specific ID
        for (i = 0; i < users.length; i++) {
            let user = users[i];
            if (user._id === id) {
                return user;
            }
        }

        // If user not found return message.
        return "User not found: " + id;
    },
    async getUserByName(username) {
        if (!username) throw "Please provide valid username.";
        const userCol = await userDb();
        const users = await userCol.find().toArray();

        // Search users for the specific ID
        for (i = 0; i < users.length; i++) {
            let user = users[i];
            if (user.username === username) {
                return user;
            }
        }

        // If user not found return message.
        return "User not found: " + username;
    }
}

module.exports = exportedMethods;