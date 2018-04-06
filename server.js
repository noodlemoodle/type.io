/* server.js
 * base server logic should go here
 *
 */
var game = require('./game');
let express = require("express");
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;
var path = require('path');


var users = []; // list of users (string)

app.get('/', function(req, res){
    res.sendFile(path.join(__dirname, "public", "index.html"));
});
app.use(express.static(path.join(__dirname, "public")));

io.on('connection', function (socket) {
    thisUser = createUser();
    console.log(thisUser + " Connected");
    socket.on("enter room", function(roomNumber){
        console.log(roomNumber);
        game.setup(socket, thisUser, roomNumber);
    });
    socket.on("disconnect", function() {
        game.exit(thisUser);
        console.log("User Disconnected");
    });
});

// Creates a user and stores it in users
function createUser(){
    var number = 1;
    while(users.indexOf("user" + number.toString()) != -1){
        number++;
    }
    var newUser = "user" + number.toString();
    users.push(newUser);
    return newUser;
}

server.listen(port, function () {
    console.log('listening on *:' + port);
});
