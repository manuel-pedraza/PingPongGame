const {io} = require("socket.io-client");

const socket = io("http://localhost:3000");

socket.on("connection", () => {
    console.log(socket.id);
})