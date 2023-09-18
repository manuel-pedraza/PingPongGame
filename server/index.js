const { Server } = require("socket.io");

const User = require("./classes/User.js");
const Lobby = require("./classes/Lobby.js");
const io = new Server();

let lstUsers = new Map();
let lstLobbies = [];
// const io = new Server(3000, {options});

io.on("connection", (socket) => {

    console.log("Socket connected " + socket.id);
    socket.on("disconnect", () => {
        console.log("Socket disconnected ", socket.id);
    });

    socket.on("addUser", (userToAdd) => {

        let userTaken = false;
        for (const user of lstUsers.values()) {
            console.log(user.name);
            if (user.name === userToAdd) {
                userTaken = true;
                break;
            }
        }

        if (lstUsers.has(socket.id) || userTaken)
            socket.emit("userAlreadyExists");
        else {
            const user = new User({ name: userToAdd });
            lstUsers.set(socket.id, user);
            socket.emit("userCreated");

        }
    });

    socket.on("disconnect", (reason) => {

        if (lstUsers.has(socket.id)) {
            const name = lstUsers.get(socket.id).name;

            console.log(lstUsers.get(socket.id).name + " was removed");
            lstUsers.delete(socket.id);

            const index = lstLobbies.findIndex(l => l.host === name || l.opponent === name);

            if (index > -1)
                lstLobbies.splice(index, 1);

        }
    });

    socket.on("createRoom", (room, name) => {
        const resLobby = new Lobby({ name: room, host: name });
        lstLobbies.push(resLobby);
        console.log(lstLobbies);

        console.log(`${socket.id} ${name} created room ${room}`);
        socket.join(room);
        socket.emit("roomCreated", resLobby);
    });

    // socket.on("joinedRoomFromList", (room, opponent) => {


    //     socket.join(room);
    //     socket.emit("joinRoom", room, opponent);
    //     io.to(room).emit("opponentJoined", opponent)
    // });

    socket.on("requestRoomList", async () => {
        /*const lstSocketsId = (await io.fetchSockets()).map(s => s.id);
        let lstRoomsToTreat = new Map(io.sockets.adapter.rooms);

        lstSocketsId.forEach(sId => {
            lstRoomsToTreat.delete(sId);
        });


        let lstRooms = [];

        for (const rtt of lstRoomsToTreat.keys())
            lstRooms.push(rtt);
        */

        
        /*
        console.log("Rooms: ", io.sockets.adapter.rooms);
        console.log("Sockets: ", lstSocketsId);
        console.log("RTT", lstRoomsToTreat);
        console.log("Rooms: ", lstRooms);
        */
        socket.emit("requestRoomList", lstLobbies);

    });

    socket.on("requestJoinRoomByRList", (room, name) => {
        const clients = io.sockets.adapter.rooms.get(room);

        if (clients === undefined) {
            socket.emit("invalidRoomName")
        }
        else if (clients.size >= 2)
            socket.emit("roomIsFull");
        else {
            const index = lstLobbies.findIndex(l => l.name === room);
            lstLobbies[index].opponent = name;

            console.log(lstLobbies);

            socket.join(room);
            io.to(room).emit("opponentJoined", lstLobbies[index]);
            socket.emit("joinedRoomFromList", lstLobbies[index]);
        }


    })

});

io.listen(3000, () => {
    console.log("listenning on port *: 3000");
});

