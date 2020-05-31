var app = require('express')();// instancia o express em app
var http = require('http').Server(app);// cria um servidor
var io = require('socket.io')(http);// cria uma conexão

var clientLookup = {};

io.on('connection', function (socket) { // uma callback que cria uma conexão via socket.io

	var current_player;

	/*socket.on('ping',function(pack){
		console.log("mensagem recebido do unity " + pack.message);

		var json_pack ={
			message: "pong!!!"
		}

		socket.emit("pong", json_pack);
	});*/

	socket.on("Join_Room", function (pack) {
		current_player = {
			name: pack.name,
			id: socket.id
		};

		clientLookup[current_player.id] = current_player;

		socket.emit("Join_Success", current_player);

		//envia o jogador atual para todos os players
		socket.broadcast.emit('Spawn_Player', current_player);

		//enviar todos os jogadores para o jogador
		for (client in clientLookup) {
			if (clientLookup[client].id != current_player.id) {
				socket.emit('Spawn_Player', clientLookup[client]);
			}
		}


	});

	socket.on("move_and_root", function (pack) {
		var data = {
			id: current_player.id,
			position: pack.position,
			rotation: pack.rotation

		}
		socket.broadcast.emit("update_pos_and_root", data);
	})
	socket.on("disconnect",function(){
		socket.broadcast.emit("USER_DISCONNECTED",{id: current_player.id});
		delete clientLookup[current_player.id];
	});

	socket.on("Player_Message",function(pack){
		
		socket.broadcast.emit("Update_Message",{id: current_player.id, message:pack.message});
		
	})
	
		


})
http.listen(process.env.PORT||3000, function () {
	console.log('server listen on 3000');
});