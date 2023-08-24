const { Server } = require("socket.io");

const io = new Server();

// const io = new Server(3000, {options});

io.on("connection", (socket) => {

    console.log("Socket connected " + socket.id);

    socket.on("disconnect", () => {
        console.log("Socket disconnected");
    });

});




io.listen(3000, () => {
    console.log("listenning on port *: 3000");
});

