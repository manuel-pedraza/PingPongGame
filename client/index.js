const { io, connect } = require("socket.io-client");
let socket = undefined;
const readline = require("node:readline/promises").createInterface({
    input: process.stdin,
    output: process.stdout,
});

let userName = "";
let opponent = "";
let roomName = "";
let isHost = false;
let canStartGame = false;


async function askForName() {

    do {
        console.clear();
        const answer = await readline.question("Enter a player name: ");
        userName = answer.trim();
    } while (userName === "" || userName === undefined)
}

readline.on("close", () => {
    console.log("Read line closed");
});

async function socketInit() {
    console.log("Connecting to server");
    socket = io("http://localhost:3000");

    socket.on("connect", () => {
        console.log("Connected to server");

        menu();
    });

    socket.on("roomCreated", (room, name, host) => {
        roomName = room;
        isHost = host === userName;
        console.log(`${name} joined the room`);
        waitInRoom();
    })

    socket.on("opponentJoined", (room, name) => {
        // console.log("Host:", host, isHost);
        console.log(`${name} joined the room`);
        opponent = name;
        canStartGame = true;
        waitInRoom();
    });

    socket.on("joinedRoomFromList", (room, name) => {
        roomName = room;
        isHost = false;
        canStartGame = true;
        console.log(`${name} joined the room`);
        waitInRoom();
    })
}

async function waitInRoom() {
    let userAnswer = "";
    const waiting = "Waiting ... (type 'exit' to quit the room): ";
    const optionToStart = `S: start the game\r\nE: to exit the room`;
    const waitingHostToStart = `Waiting from ${opponent} to start the game`;

    const question = isHost && canStartGame ? optionToStart : isHost ? waiting : waitingHostToStart; 

    console.log(`${roomName}`);
    console.log(`Players:
    ${isHost ? "(Host) " : ""}(You) ${userName} 
    ${!isHost ? "(Host) " : ""}${opponent === "" ? "[Open]" : opponent}`
    );
    userAnswer = (await readline.question(question)).trim();
    console.clear();



    if(userAnswer === "exit")
        menu();
    else
        waitInRoom();    
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
    getRoomList().forEach(r => {
        console.log(`\tName: ${r} | Host: ${"someone"}`);
    });
}

async function interfaceRoomListMenu() {
    let userAnswer = "";

    while (userAnswer.toLowerCase() !== "b") {
        showRoomList();
        showRoomListMenu();
        userAnswer = (await readline.question("Choose a room (type 'b' to back): ")).trim();
        
        console.clear();

        // do something to join room
    }
}

async function menu() {
    let userAnswer = "";
    /*
        menu,
        joinRoom,
        waitInRoom
    */
    let state = "menu";


    while (userAnswer !== "exit") {

        switch (state) {
            case "menu":
                showMenu();
                userAnswer = (await readline.question("Choose (type 'exit' to quit the program): ")).trim();

                switch (userAnswer.toLowerCase()) {
                    case "1":
                        state = "joinRoom";
                        break;
                    case "2":
                        const wasRoomCreated = await createRoom();
                        if (wasRoomCreated) {
                            state = "waitInRoom";
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

                break;
            case "waitInRoom":
                console.log("Creating Room");
                return;
            case "joinRoom":
                const result = await interfaceRoomListMenu();

                break;

            default:
                console.log("An error has occured");
                process.exit(-1);
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

function getRoomList() {
    return ['1', '2'];
}

function joinRoom(roomName) {

}

async function main() {
    await askForName();
    socketInit();
}

main();

