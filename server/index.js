const { Server } = require("socket.io");
const io = new Server();

// const io = new Server(3000, {options});

io.on("connection", (socket) => {

    console.log("Socket connected " + socket.id);
    socket.on("disconnect", () => {
        console.log("Socket disconnected ", socket.id);
    });

    socket.on("createRoom", (room, name) => {
        console.log(`${socket.id} ${name} created room ${room}`);
        socket.join(room);
        socket.emit("roomCreated", room, name, name);
    });

    socket.on("joinedRoomFromList", (room, opponent) => {
        socket.join(room);
        socket.emit("joinRoom", room, opponent);
        io.to(room).emit("opponentJoined", opponent)
    });

    socket.on("requestRoomList", async () => {
        const lstSocketsId = (await io.fetchSockets()).map(s => s.id);
        let lstRoomsToTreat = new Map(io.sockets.adapter.rooms);

        lstSocketsId.forEach(sId => {
            lstRoomsToTreat.delete(sId);
        });


        let lstRooms = [];

        for (const rtt of lstRoomsToTreat.keys())
            lstRooms.push(rtt);

        /*
        console.log("Rooms: ", io.sockets.adapter.rooms);
        console.log("Sockets: ", lstSocketsId);
        console.log("RTT", lstRoomsToTreat);
        console.log("Rooms: ", lstRooms);
        */
        socket.emit("requestRoomList", lstRooms);

    });

    socket.on("requestJoinRoomByRList", (room, name) => {
        const clients = io.sockets.adapter.rooms.get(room);

        if (clients.size >= 2)
            socket.emit("roomIsFull");
        else {
            socket.join(room);
            io.to(room).emit("opponentJoined", name);
            socket.emit("joinedRoomFromList", room, name);
        }


    })

});

io.listen(3000, () => {
    console.log("listenning on port *: 3000");
});

