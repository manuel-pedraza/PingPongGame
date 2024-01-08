const { Server } = require("socket.io");

const crypto = require("node:crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const User = require("./classes/User.js");
const Lobby = require("./classes/Lobby.js");
const { InMemorySessionStore } = require("./classes/sessionStore.js");
const userStates = require("./enums/userStates.js");
const sessionStore = new InMemorySessionStore();

const io = new Server({
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    },
    pingInterval: 2000,
    pingTimeout: 5000
});

let lstLobbies = [
    new Lobby({
        name: 'hi',
        host: 'a',
        opponent: 'b'
    })
];


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
            socket.user = session.user;
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
    socket.user = new User({ name: undefined, state: userStates.inactive });

    next();

});

io.on("connection", (socket) => {

    console.log("SC (id, session): ", socket.id, socket.sessionID, socket.user);

    if (socket.user.name === "" || socket.user.name === null)
        socket.user.state = userStates.inactive;
    else
        socket.user.state = userStates.mainMenu;

    sessionStore.saveSession(socket.sessionID, {
        userID: socket.userID,
        user: socket.user,
        connected: true,
    });

    socket.emit("session", {
        sessionID: socket.sessionID,
        userID: socket.userID,
        user: socket.user,
    });

    socket.join(socket.userID);



    socket.on("addUser", (userToAdd) => {

        const userNotValid = userToAdd === "" || userToAdd === null;
        if (userNotValid) {
            socket.emit("errorAddingUser", "User is not valid");
            return;
        }

        for (const session of sessionStore.sessions.values()) {
            // console.log(user.name);
            if (session.user.name === userToAdd) {


                if (session.connected === true) {
                    socket.emit("errorAddingUser", "User already taken");
                    return
                }
                else {
                    session.user.name = undefined;
                }

                break;
            }
        }

        console.log(userToAdd);


        socket.user.name = userToAdd;
        socket.user.state = userStates.mainMenu;
        sessionStore.saveSession(socket.sessionID, {
            userID: socket.userID,
            user: socket.user,
            connected: true,
        });

        console.log("SES", sessionStore.findAllSessions());
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
            socket.leave("requestRoomList");
            socket.user.state = userStates.inactive;
            sessionStore.saveSession(socket.sessionID, {
                userID: socket.userID,
                user: socket.user,
                connected: false,
            });

            console.log(sessionStore.sessions);

            const index = lstLobbies.findIndex(l => l.host === socket.user.name || l.opponent === socket.user.name);

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
        socket.broadcast.to("requestRoomList").emit("newRoomCreated", resLobby);
        socket.emit("roomCreated", resLobby);
    });

    socket.on("requestRoomList", () => {
        socket.user.state = userStates.roomList;
        socket.join("requestRoomList");
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

            socket.user.state = userStates.mainMenu;
            socket.join(room);

            io.to(room).emit("opponentJoined", lobby);
            socket.emit("joinedRoomFromList", lobby);

        }

    })

    socket.on("startGame", (room, lobbyInfos) => {

        let lobby = lstLobbies.find(r => r.name === room);
        socket.user.state = userStates.inGame;

        if (lobby === undefined) {
            socket.emit("errorStartingGame", "Error starting the game");
        }
        else {
            io.to(room).emit("startedGame", lobbyInfos);
        }


    })

    socket.on("mainMenu", () => {

        socket.user.state = userStates.mainMenu;
        socket.leave("requestRoomList");

        const index = lstLobbies.findIndex(l => l.host === socket.user.name);

        if (index > -1)
            lstLobbies.splice(index, 1);

    });


    socket.on("playerConnected", (lobby) => {

        console.log("PLAYER CONNECTED");

        const normalizedLobby = new Lobby({ ...lobby, name: lobby.lobbyName });
        const { name } = normalizedLobby;

        const index = lstLobbies.findIndex(l => l.name === name);

        if (index < 0) {
            console.log("LOBBY NOT FOUND");
            return
        }

        // socket.join(name);
        let lobbyTmp = lstLobbies[index];

        if (lobby.isHost === "true")
            lobbyTmp.hostConnected = true;
        else
            lobbyTmp.opponentConnected = true;

        if (lobbyTmp.hostConnected === true && lobbyTmp.opponentConnected === true) {
            lobbyTmp.gameStarted = true;
            console.log("GAME CAN START");

            io.to(name).emit("gameCanStart");

        }

        lstLobbies[index] = lobbyTmp;

    })

});

io.listen(3001, () => {
    console.log("listenning on port *: 3001");
});

