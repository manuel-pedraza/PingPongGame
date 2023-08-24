const { io, connect } = require("socket.io-client");
let socket = undefined;
const readline = require("node:readline/promises").createInterface({
    input: process.stdin,
    output: process.stdout,
});

let userName = "";
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

}

function showMenu() {
    console.log(
        `Options:
    1. See Room List
    2. Create Room`
    );
}

function seeRoomListMenu(){

}

async function menu(){
    let userAnswer = "";

    while (userAnswer !== "exit") {
        showMenu();
        userAnswer = (await readline.question("Choice (type 'exit' to quit the program): ")).trim();
        console.clear();

        switch (userAnswer) {
            case "1":
                seeRoomListMenu();
                break;
            case "2":
                break;
            case "exit":
                continue;
            default:
                console.log("Not a valid option");
                break;
        }

    }
}

function creatRoom() {

}

function getRoomList(){
    return ['1', '2'];
}

function showRoomList(){

}

function joinRoom(roomName) {

}

async function main() {
    await askForName();
    socketInit();
}

main();

