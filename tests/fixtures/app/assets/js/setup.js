io.socket.on('user', function(msg) {console.log("RECEIVED 'user' SOCKET MSG ->"); console.log(msg);});
io.socket.on('pet', function(msg) {console.log("RECEIVED 'pet' SOCKET MSG ->"); console.log(msg);});
io.socket.get("/user", function() {console.log("Subscribed to users...");});
io.socket.get("/pet", function() {console.log("Subscribed to pets...");});
