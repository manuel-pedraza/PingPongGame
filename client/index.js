const { io, connect } = require("socket.io-client");
let socket = undefined;
const readline = require("node:readline/promises").createInterface({
    input: process.stdin,
    output: process.stdout,
});

let userName = "";
let opponent = "";
let roomName = "";
let connectedToServer = false;


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

    socket.on("joinRoom", (room, name) => {
        roomName = room;
        console.log(`${name} joined the room`);
        waitInRoom();
    })

}

async function waitInRoom() {
    let userAnswer = "";
    while (userAnswer !== "exit") {

        console.log(`${roomName}`);
        console.log(`Players:
    (Host) (You) ${userName} 
    ${opponent === "" ? "[Open]" : opponent}`
        );
        userAnswer = (await readline.question("Waiting ... (type 'exit' to quit the room): ")).trim();
        console.clear();

        // do something to join room
    }
}

function showMenu() {
    console.log(
        `Options:
    1. See Room List
    2. Create Room`
    );
}

function showRoomListMenu() {
    console.log(
        `Options:
    1. Join room name
    2. Refresh room list`
    );
}

function showRoomList() {
    console.log("Rooms list: ");
    getRoomList().forEach(r => {
        console.log(`   Name: ${r} | Host: ${"someone"}`);
    });
}

async function seeRoomListMenu() {
    let userAnswer = "";

    while (userAnswer !== "b") {
        console.clear();
        showRoomList();
        showRoomListMenu();
        userAnswer = (await readline.question("Choose a room (type 'b' to back): ")).trim();


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

                switch (userAnswer) {
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
                const result = await seeRoomListMenu();

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

        if (room === "b")
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

