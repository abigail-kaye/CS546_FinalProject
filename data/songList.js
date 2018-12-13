const mongoCollections = require("../config/mongoCollections");
const songDb = mongoCollections.songCollection;

let exportedMethods = {
    async createList(){
        const songsCol = await songDb();
        const songs = await songsCol.find().toArray();

        let table = document.getElementById("songTable");
        

        for (i = 0; i < songs.length; i++){
            let rowCount = table.rows.length;
            let row = table.insertRow(rowCount);

            let song = songs[i];
            row.insertCell(0).innerHTML = song.title;
            row.insertCell(1).innerHTML = song.artist;
            row.insertCell(2).innerHTML = song.album;
            row.insertCell(3).innerHTML = song.genre;
            row.insertCell(4).innerHTML = song.rating;
        }
    },

}
module.exports = exportedMethods;