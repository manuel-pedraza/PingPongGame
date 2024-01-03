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

let lstLobbies = [];
// const io = new Server(3000, {options});

io.use((socket, next) => {

    const sessionID = socket.handshake.auth.sessionID;

    console.log("SESSION: ", sessionID);
    if (sessionID) {
        // find existing session
        const session = sessionStore.findSession(sessionID);
        //  && session.connected === true
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

    console.log("SC (id, session): ", socket.id, socket.sessionID);

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



    socket.on("addUser", (userToAdd) => {

        const userNotValid = userToAdd === "" || userToAdd === null;
        if (userNotValid){
            socket.emit("errorAddingUser", "User is not valid");
            return;
        }

        for (const user of sessionStore.sessions.values()) {
            // console.log(user.name);
            if (user.username === userToAdd) {


                if (user.connected === true) {
                    socket.emit("errorAddingUser", "User already taken");
                    return
                }
                else {
                    user.username = undefined;
                }

                break;
            }
        }

        console.log(userToAdd);


        socket.username = userToAdd;
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            username: userToAdd,
            connected: true,
        });

        console.log("SES", sessionStore.findAllSessions());

        const user = new User({ name: userToAdd });
        socket.emit("userCreated");

    });

    socket.on("disconnect", async () => {

        const matchingSockets = await io.in(socket.userID).fetchSockets();
        const isDisconnected = matchingSockets.length === 0 || matchingSockets.size === 0;
        console.log(isDisconnected, matchingSockets);
        if (isDisconnected) {
            // notify other users
            // socket.broadcast.emit("user disconnected", socket.userID);
            // update the connection status of the session
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                username: socket.username,
                connected: false,
            });

            console.log(sessionStore.sessions);

            const index = lstLobbies.findIndex(l => l.host === socket.username || l.opponent === socket.username);

            if (index > -1)
                lstLobbies.splice(index, 1);

        }

        console.log("Socket disconnected ", socket.id);
    });

    socket.on("disconnecting", async (reason) => {

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

            const index = lstLobbies.findIndex (l => l.name === room);
            lstLobbies[index] = lobby;

            console.log(lstLobbies);
            
            socket.join(room);
            io.to(room).emit("opponentJoined", lobby);
            socket.emit("joinedRoomFromList", lobby);
            
        }

        
    })

    socket.on("startGame", (room, lobbyInfos) => {

        let lobby = lstLobbies.find(r => r.name === room);


        if (lobby === undefined) {
            socket.emit("errorStartingGame", "Error starting the game");
        }
        else {
            io.to(room).emit("startedGame", lobbyInfos);
        }

        
    })

});

io.listen(3001, () => {
    console.log("listenning on port *: 3001");
});

