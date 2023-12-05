const { Server } = require("socket.io");

const crypto = require("node:crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const User = require("./classes/User.js");
const Lobby = require("./classes/Lobby.js");
const { InMemorySessionStore } = require("./classes/sessionStore.js");
const sessionStore = new InMemorySessionStore();

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

let lstUsers = new Map();
let lstLobbies = [];
// const io = new Server(3000, {options});


io.use((socket, next) => {

    const sessionID = socket.handshake.auth.sessionID;

    console.log("SESSION: ", sessionID);
    if (sessionID) {
        // find existing session
        const session = sessionStore.findSession(sessionID);
        if (session) {

            console.log("SESSION: ", session);
            socket.sessionID = sessionID;
            socket.userID = session.userID;
            socket.username = session.username;
            return next();
        }
    }

    // Create new session

    // const username = socket.handshake.auth.username;

    // if(!username){
    //     return next(new Error("Invalid Username"));
    // }

    // socket.username = username;

    socket.sessionID = randomId();
    socket.userID = randomId();

    next();

});

io.on("connection", (socket) => {

    console.log("SC (id, session): ", socket.id, socket.sessionID );

    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        username: socket.username,
        connected: true,
    });
    
    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
        username: socket.username
    });

    socket.join(socket.userID);
    
    socket.on("disconnect", async () => {

        const matchingSockets = await io.in(socket.userID).fetchSockets();
        const isDisconnected = matchingSockets.size === 0;
        if (isDisconnected) {
            // notify other users
            // socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: false,
            });

            if (lstUsers.has(socket.id)) {
                const name = lstUsers.get(socket.id).name;

                console.log(lstUsers.get(socket.id).name + " was removed");
                lstUsers.delete(socket.id);

                const index = lstLobbies.findIndex(l => l.host === name || l.opponent === name);

                if (index > -1)
                    lstLobbies.splice(index, 1);


            }
        }

        console.log("Socket disconnected ", socket.id);
    });

    socket.on("addUser", (userToAdd) => {

        let userTaken = false;

        for (const user of lstUsers.values()) {
            // console.log(user.name);
            if (user.name === userToAdd) {
                userTaken = true;
                break;
            }
        }

        console.log(userToAdd);

        // const userAlreadyExists = lstUsers.has(socket.id) || userTaken;
        const userNotValid = userToAdd === "" || userToAdd === null;

        if (userTaken || userNotValid)
            socket.emit("errorAddingUser", userTaken ? "User already taken" : "User is not valid");
        // socket.emit("errorAddingUser", userAlreadyExists ? "User already taken" : "User is not valid");
        else {

            socket.username = userToAdd;
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: userToAdd,
                connected: true,
            });

            console.log("SES", sessionStore.findAllSessions());

            const user = new User({ name: userToAdd });
            lstUsers.set(socket.id, user);
            socket.emit("userCreated");

        }
    });

    socket.on("disconnecting", async (reason) => {


    });

    socket.on("disconnect", async (reason) => {
        const matchingSockets = await io.in(socket.userID).allSockets();
        const isDisconnected = matchingSockets.size === 0;

        if (isDisconnected) {
            // notify other users
            // socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: false,
            });
        }

        console.log(reason);

    });

    socket.on("createRoom", (room, name) => {
        // TODO: 
        //  - Add validations
        //  - Make broadcast for those looking the room list

        const resLobby = new Lobby({ name: room, host: name });
        lstLobbies.push(resLobby);
        console.log(lstLobbies);

        console.log(`${socket.id} ${name} created room ${room}`);
        socket.join(room);
        socket.emit("roomCreated", resLobby);
    });

    socket.on("requestRoomList", () => {
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
        // const clients = io.sockets.adapter.rooms.get(room);

        let lobby = lstLobbies.find(r => r.name === room);

        if (lobby === undefined || lobby.opponent !== undefined) {
            socket.emit("errorJoiningRoom", lobby === undefined ? "Invalid room name" : "The room is full");
        }
        else {
            lobby.opponent = name;
            const index = lstLobbies.findIndex(l => l.name === room);
            lstLobbies[index] = lobby;

            console.log(lstLobbies);

            socket.join(room);
            io.to(room).emit("opponentJoined", lstLobbies[index]);
            socket.emit("joinedRoomFromList", lstLobbies[index]);
        }


    })

});

io.listen(3001, () => {
    console.log("listenning on port *: 3001");
});

