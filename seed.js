const songs = require('./data/songs');

const seedSongs = [{
    "name": "Toxic",
    "artist": "Britney Spears",
    "album": "In The Zone",
    "rating": "4",
    "genres": [
        "Dance",
        "Pop"
    ]
},
{
    "name": "Me Against the World",
    "artist": "2Pac",
    "album": "Me Against the World",
    "rating": "5",
    "genres": [
        "Rap"
    ]
},
{
    "name": "November Rain",
    "artist": "Guns N Roses",
    "album": "Use Your Illusion 1",
    "rating": "5",
    "genres": [
        "Metal",
        "Rock"
    ]
},
{
    "name": "Gangnam Style",
    "artist": "Psy",
    "album": "Gangnam Style",
    "rating": "4",
    "genres": [
        "Dance",
        "Pop"
    ]
},
{
    "name": "Bad Romance",
    "artist": "Lady Gaga",
    "album": "The Fame Monster",
    "rating": "5",
    "genres": [
        "Dance",
        "Pop"
    ]
}];

const main = async () => {
    
    for (var key in seedSongs) {
        if (seedSongs.hasOwnProperty(key)) {
            await songs.addSong(seedSongs[key].name, seedSongs[key].artist, seedSongs[key].album, seedSongs[key].genres, seedSongs[key].rating);
        }
    }
};

main().catch(console.log);