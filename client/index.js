// SOCKET.IO API LINK: https://socket.io/docs/v4/server-api/#serveremiteventname-args
// SOCKET.IO DOCS: https://socket.io/docs/v4/how-it-works/
// SOCKET.IO GET-STARTED APP: https://socket.io/get-started/chat
// READLINE DOCS: https://nodejs.org/api/readline.html

const { io, connect } = require("socket.io-client");
let socket = undefined;
const readline = require("node:readline/promises").createInterface({
    input: process.stdin,
    output: process.stdout,
});

let userName = "";
let opponent = "";
let roomName = "";
let isNameValid = false;
let isHost = false;
let canStartGame = false;
let lstRooms = [];

async function askForName() {

    if (isNameValid)
        return;

    const answer = await readline.question("Enter a player name: ");
    userName = answer.trim();
    if (!(userName === "" || userName === undefined))
        socket.emit("addUser", userName);
    else
        askForName();

}

readline.on("close", () => {
    console.log("Read line closed");
});

async function socketInit() {
    console.log("Connecting to server");
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
        console.log("Connected to server");
        askForName();
    });

    socket.on("roomCreated", (room, name, host) => {
        roomName = room;
        isHost = host === userName;
        console.log(`Room created`);
        console.log(`${name} joined the room`);
        waitInRoom();
    })

    socket.on("opponentJoined", (name) => {
        // console.log("Host:", host, isHost);
        console.log(`${name} joined the room`);
        opponent = name;
        canStartGame = true;
        waitInRoom();
    });

    socket.on("userAlreadyExists", () => {
        console.log("User already exists");
        askForName()
    });

    socket.on("userCreated", () => {
        console.log("User created");
        isNameValid = true;
        menu();

    });

    socket.on("joinedRoomFromList", (room, name) => {
        roomName = room;
        isHost = false;
        canStartGame = true;
        readline.resume();
        console.log(`${name} joined the room`);
        waitInRoom();
    });

    socket.on("requestRoomList", (roomList) => {
        lstRooms = roomList;
        console.log("Room list: ", roomList);
        interfaceRoomListMenu()
    });

    socket.on("roomIsFull", () => {
        console.log("Someone already joined the room");
        interfaceRoomListMenu()
    });
}

async function waitInRoom() {
    let userAnswer = "";
    const eToExit = "E: to exit the room";
    const waiting = "Waiting ...\r\n" + eToExit;
    const optionToStart = `S: start the game\r\n` + eToExit;
    const waitingHostToStart = `Waiting from ${opponent} to start the game`;

    const question = isHost && canStartGame ? optionToStart : isHost ? waiting : waitingHostToStart;

    console.log(`${roomName}`);
    console.log(`Players:
    ${isHost ? "(Host) " : ""}(You) ${userName} 
    ${!isHost ? "(Host) " : ""}${opponent === "" ? "[Open]" : opponent}`
    );
    userAnswer = (await readline.question(question)).trim();
    console.clear();


    switch (userAnswer.toLowerCase()) {
        case "e":
            menu();
            break;

        default:
            waitInRoom();
            break;
    }
    // do something to join game
}

function showMenu() {
    console.log(
        `Options:
    1: See Room List
    2: Create Room`
    );
}

function showRoomListMenu() {
    console.log(
        `Options:
    1: Join room name
    2: Refresh room list`
    );
}

function showRoomList() {
    console.log("Room list: ");
    lstRooms.forEach(r => {
        console.log(`\tName: ${r} | Host: ${"someone"}`);
    });
}

async function interfaceRoomListMenu() {
    let userAnswer = "";

    showRoomList();
    showRoomListMenu();
    userAnswer = (await readline.question("Choose an option (type 'b' to back): ")).trim();

    switch (userAnswer.toLowerCase()) {
        case "b":
            menu();
            break;
        case "1":
            userAnswer = (await readline.question("Enter the room's name: ")).trim();
            socket.emit("requestJoinRoomByRList", userAnswer, userName);
            break;
        case "2":
            socket.emit("requestRoomList");
            break;
        default:
            interfaceRoomListMenu();
            break;
    }
    console.clear();



    // do something to join room
}

async function menu() {
    let userAnswer = "";
    /*
        menu,
        joinRoom,
        waitInRoom
    */
    let state = "menu";


    while (userAnswer.toLowerCase() !== "exit" && state === "menu") {
        showMenu();
        userAnswer = (await readline.question("Choose (type 'exit' to quit the program): ")).trim();

        switch (userAnswer.toLowerCase()) {
            case "1":
                state = "joinRoom";
                console.clear();
                console.log("Getting room list");
                socket.emit("requestRoomList");
                return;
            case "2":
                console.clear();
                const wasRoomCreated = await createRoom();
                if (wasRoomCreated) {
                    state = "waitInRoom";
                    console.log("Creating Room");
                    return;
                }
                break;
            case "exit":
                console.log("Quited the program");
                readline.close();
                process.exit(1);
            default:
                console.log("Not a valid option");
                break;
        }

        console.clear();
    }
}

async function createRoom() {

    let room = "";

    while (room === "") {
        room = (await readline.question("Type your name's room (type 'b' to back): ")).trim();

        if (room.toLowerCase() === "b")
            return false;
    }

    socket.emit("createRoom", room, userName);
    return true;
}



socketInit();

