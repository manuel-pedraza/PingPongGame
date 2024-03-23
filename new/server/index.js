// understand .emit() use cases: https://stackoverflow.com/questions/10058226/send-response-to-all-clients-except-sender
const { Server } = require("socket.io");

const crypto = require("node:crypto");
const randomId = () => crypto.randomBytes(8).toString("hex");
const User = require("./classes/User.js");
const Lobby = require("./classes/Lobby.js");
const { InMemorySessionStore } = require("./classes/sessionStore.js");
const userStates = require("./enums/userStates.js");
const Game = require("./classes/Game.js");
const { error, log } = require("node:console");
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
        name: '````hi````',
        host: 'z',
        opponent: 'x'
    })
];

let games = new Map();


// const io = new Server(3000, {options});

io.use((socket, next) => {

    const sessionID = socket.handshake.auth.sessionID;

    // console.log("SESSION: ", sessionID);
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
        console.log(userToAdd);
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

    socket.on("createRoom", (room, name, points) => {
        let lobby = lstLobbies.find(r => r.name === room);

        if (lobby) {
            socket.emit("errorCreatingRoom", "Room name already taken");
            return;
        }

        const resLobby = new Lobby({ name: room, host: name, points: points });
        lstLobbies.push(resLobby);

        console.log(lstLobbies);
        console.log(`${socket.id} ${name} created room ${room}`);

        socket.user.state = userStates.waitingRoom;
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

        if (!lobby || lobby.opponent) {
            socket.emit("errorJoiningRoom", !lobby ? "Invalid room name" : "The room is full");
        }
        else {
            lobby.opponent = name;

            const index = lstLobbies.findIndex(l => l.name === room);
            lstLobbies[index] = lobby;

            console.log(lstLobbies);

            socket.user.state = userStates.waitingRoom;
            socket.join(room);

            io.to(room).emit("opponentJoined", lobby);
            socket.emit("joinedRoomFromList", lobby);
            socket.leave("requestRoomList");


        }

    })

    socket.on("startGame", (room) => {

        let lobby = lstLobbies.find(r => r.name === room);
        socket.user.state = userStates.inGame;

        if (!lobby) {
            socket.emit("errorStartingGame", "Error starting the game");
        }
        else {
            games.set(room, new Game());
            socket.broadcast.to(room).emit("startedGame", { lobbyName: room });
        }


    })

    socket.on("mainMenu", () => {

        switch (socket.user.state) {
            case userStates.waitingRoom:
                const index = lstLobbies.findIndex(l => l.host === socket.user.name || l.opponent === socket.user.name);

                if (index > -1) {
                    let lobby = lstLobbies[index];

                    if (lobby.host === socket.user.name) {
                        socket.broadcast.to(lobby.name).emit("gameCancelled");
                        io.socketsLeave(lobby.name);
                        lstLobbies.splice(index, 1);

                    } else {
                        socket.leave(lobby.name);
                        socket.broadcast.to(lobby.name).emit("opponentLeft");
                        lstLobbies[index].opponent = undefined;

                    }
                }

                break;

            case userStates.roomList:
                socket.leave("requestRoomList");

                break;
            default:
                break;
        }

        socket.user.state = userStates.mainMenu;

    });


    socket.on("playerConnected", (lobby) => {

        console.log("PLAYER CONNECTED");

        const normalizedLobby = new Lobby({ ...lobby, name: lobby.lobbyName });
        const { name } = normalizedLobby;

        const index = lstLobbies.findIndex(l => l.name === name);

        if (index < 0) {
            console.log("LOBBY NOT FOUND");
            return;
        }

        // socket.join(name);
        let lobbyTmp = lstLobbies[index];
        let game = games.get(name);

        if (lobby.isHost === "true") {
            game.hostSocket = socket.id;
        }
        else {
            game.opponentSocket = socket.id;

        }
        console.log("G1", game);
        games.set(name, game);

        if (game.hostSocket && game.opponentSocket) {
            lobbyTmp.gameStarted = true;
            console.log("GAME CAN START");

            games.set(name, game);
            io.to(name).emit("gameCanStart", { host: lobbyTmp.host, opponent: lobbyTmp.opponent, points: lobbyTmp.points });

        }

        lstLobbies[index] = lobbyTmp;

    })

    setInterval(() => {

        games.forEach((game, room) => {

            // console.log(room);

            if (!game.hasGameEnded && (game.hasPosChanged || game.havePointsChanged)) {

                /*
                OPTIONAL: Implement sending some data and not ALL the data. Help with some performence IG
                const positions =  {};
                const points = game.havePointsChanged ? {hostPoints: game.hostPoints, opponentPoints: } : {};
                const game = {};
                */

                io.in(room).emit("updatePlayers", {
                    hostPos: game.hostPos,
                    opponentPos: game.opponentPos,
                    hostPoints: game.hostPoints,
                    opponentPoints: game.opponentPoints,
                    hostSeq: game.hostSeq,
                    oppSeq: game.oppSeq
                });;

                game.resetChangedProps();
            }
        });

    }, 15);


    socket.on("EPong", (roomName, { event, value, }, sequenceNumber) => {

        let game = games.get(roomName);

        // TODO: Validate request socket is the host socket or the opponnent socket
        if (!socket.rooms.has(roomName) || !game) return;

        const isHost = game.hostSocket === socket.id;

        if (isHost)
            game.hostSeq = sequenceNumber;
        else
            game.oppSeq = sequenceNumber;

        switch (event) {
            case "mouseMove":
                game.changePos(isHost, value);
                break;

            default:
                break;
        }

    });
});

io.listen(3001, () => {
    console.log("listenning on port *: 3001");
});

