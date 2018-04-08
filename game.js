/* game.js
 * all game logic should go in here
 *
 */

// room objects, contains information specific to the rooms.
// users= array of useres
// name = rooms name, used to broadcast to rooms
// word = word to typed
// index = current index of word progress
// split = assigned letter to word, ex[1, 2, 4, 3, 2, 1, 1], see splitWord()
var room1 = {
    users: [],
    name: 'room 1',
    word: "HelloWorld1",
    index: 0,
    split: [],
}
var room2 = {
    users: [],
    name: 'room 2',
    word: "HelloWorld2",
    index: 0,
    split: [],
}
var room3 = {
    users: [],
    name: 'room 3',
    word: "HelloWorld3",
    index: 0,
    split: [],
}
var room4 = {
    users: [],
    name: 'room 4',
    word: "HelloWorld4",
    index: 0,
    split: [],
}
var rooms = [room1, room2, room3, room4];

// Anytime you add a function make sure to update this
module.exports = {
    setup: _setup,
    exit: _exit,
};

// Called whenever a socket enters the room. Currently the socket that starts on
// index.html is not the same socket
function _setup(io, _sock, username, roomNumber) {

    // set the room
    // TODO: Might be a more elegant solution than using rooms[roomNumber-1]... but it works
    if (rooms[roomNumber-1].users.length >= 4){
        console.log("Too Many Users");
    }
    else {
        // Setup the user and socket in the room
        rooms[roomNumber-1].users.push(username);
        _sock.join(rooms[roomNumber-1].name);
        _sock.emit("player setup", username);
        _sock.emit('player entered', rooms[roomNumber-1].users); // TODO: Idk why socket.in doesnt send to the sender... had to this line in several places. kinda bandaid fix
        _sock.in(rooms[roomNumber-1].name).emit('player entered', rooms[roomNumber-1].users);

        // Start game button (or some other event) is clicked
        // split the word and send the final users
        _sock.on("start game", function(){
            splitWord(roomNumber);
            _sock.emit('start game', rooms[roomNumber-1]);
            _sock.in(rooms[roomNumber-1].name).emit('start game', rooms[roomNumber-1]);
        });

        // Whenever a letter is typed from a client, then update the progress for clients
        _sock.on("letter typed", function(letter, _index){
            if (_index == rooms[roomNumber-1].split[rooms[roomNumber-1].index]){
                if (letter == rooms[roomNumber-1].word[rooms[roomNumber-1].index]){
                    rooms[roomNumber-1].index += 1;
                    _sock.emit("word update", rooms[roomNumber-1]);
                    _sock.in(rooms[roomNumber-1].name).emit("word update", rooms[roomNumber-1]);
                }
            }
        });

        console.log(username + " has entered room" + roomNumber);
    }

}

// clear the split array and split the word among players
// room.split[] will contain [0, 2, 2, 3, ...]
// which corrolates to users[0] types first letter, users[2] types next two, then users[4] types the next etc.
function splitWord(roomNumber) {
    rooms[roomNumber-1].split = []
    for (i = 0; i < rooms[roomNumber-1].word.length; i++){
        let identifier = Math.floor(Math.random() * rooms[roomNumber-1].users.length)
        rooms[roomNumber-1].split.push(identifier);
    }
    console.log(rooms[roomNumber-1].split.toString());
}

function _exit(_sock, username, roomNumber){
    if (roomNumber > 0){
        let index = rooms[roomNumber-1].users.indexOf(username);
        if (index > -1) {
          rooms[roomNumber-1].users.splice(index, 1);
        }
        _sock.in(rooms[roomNumber-1].name).emit('player exited', rooms[roomNumber-1].users);
    }

    console.log(username + " has exited room" + roomNumber);
}
