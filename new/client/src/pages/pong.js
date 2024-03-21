import Actor from '@/classes/pongGame/Actor';
import Ball from '@/classes/pongGame/Ball';
import Player from '@/classes/pongGame/Player';
import { socket } from "@/classes/socket";
import { SP } from 'next/dist/shared/lib/utils';
import { useRouter } from 'next/router';
import React, { useEffect, useMemo, useRef, useState } from 'react'

export default function Pong() {

    const [lobby, setLobby] = useState(undefined);
    const [isConnected, setIsConnected] = useState(undefined);
    // const [game, setGame] = useState(undefined);
    const [gameHasStarted, setGameHasStarted] = useState(false);
    const router = useRouter();


    // const gameData = useMemo(() => {return game}, [game]);

    let context = undefined;
    let canvas = undefined;
    let devicePixelRatio = undefined;

    let playerTurn = "p1";

    const game = useRef(null);
    const canvasRef = useRef(null);

    const drawBg = () => {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        // context.fillRect(0, 0, canvas.width * devicePixelRatio, canvas.height * devicePixelRatio);
        context.fill();

    }

    const drawMiddleLine = () => {

        const middle = canvas.width / 2;
        const height = canvas.height;
        const squareSize = 10 * devicePixelRatio;
        const squaresToDraw = height / squareSize / 2 + 1;

        context.fillStyle = "#fff";

        for (let i = 0; i <= squaresToDraw; i++) {
            context.fillRect(middle - (squareSize / 2), i * squareSize + (i * squareSize) - (squareSize / 2), squareSize, squareSize);
            context.fill();
        }
    }

    // Lobby Effect
    useEffect(() => {

        // console.log("Q", router.query);

        const recievedLobby = router.query;

        if (!recievedLobby || !recievedLobby.isHost && !recievedLobby.lobbyName
        ) {
            setLobby(undefined);
            return
        }

        let lobby = {
            isHost: recievedLobby.isHost ? recievedLobby.isHost : false,
            lobbyName: recievedLobby.lobbyName,
        };

        setLobby(lobby)

        // console.log("RL", recievedLobby);
        // console.log("LOBBY:", lobby);

    }, [router.query]);


    // GameLogic Effect
    useEffect(() => {

        canvas = canvasRef.current;
        context = canvas.getContext("2d");
        devicePixelRatio = window.devicePixelRatio || 1;
        canvas.height = window.innerHeight * devicePixelRatio;
        canvas.width = window.innerWidth * devicePixelRatio;

        let frameCount = 0;
        let animationFrameId;
        let actors = undefined;
        let playerControl = undefined;


        let newYPos = undefined;

        setInterval(() => {

            let p = actors.get(playerControl);

            if (newYPos !== p.y) {
                // const speed = Math.abs(p.y - e.y);
                // p.speedQueue.enqueue(speed);

                if (lobby) {
                    console.log(newYPos);
                    socket.emit("EPong", lobby.lobbyName, { event: "mouseMove", value: newYPos });
                }

                p.updatePos(p.x, newYPos);
            }

        }, 15);

        function EOnMouseMove(e) {
            // console.log("lON", lobby);

            let p = actors.get(playerControl);


            if (p) {
                // const speed = Math.abs(p.y - e.y);
                // p.speedQueue.enqueue(speed);

                if (isNaN(p.y))
                    p.y = e.y;

                newYPos = e.y;
            }
        }

        canvas.addEventListener("mousemove", EOnMouseMove);

        function initPong() {
            let player1 = new Player("p1", context, devicePixelRatio, canvas.width * 0.05, context.canvas.height * 0.5);
            let player2 = new Player("p2", context, devicePixelRatio, canvas.width * 0.95, context.canvas.height * 0.5);
            let ball = new Ball(context, canvas.width / 2, canvas.height / 2);

            const SPEED = 12;

            player1.speed = SPEED;
            player2.speed = SPEED;

            actors = new Map();
            actors.set("p1", player1);
            actors.set("p2", player2);
            actors.set("ball", ball);


            playerControl = lobby && (!lobby.isHost || lobby.isHost === false) ? "p2" : "p1";

        }

        let ballColor = 0;

        function render() {
            // console.log(e.elapsedTime);
            context.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;
            drawBg();
            drawMiddleLine();

            // Update Ball new Pos
            let ball = actors.get("ball");
            if (ball) {

                if (!ball.player && ball.direction !== null) {
                    const p = ball.direction === true ? "p1" : "p2";
                    // console.log(playerTurn, ball.direction, p);
                    ball.player = actors.get(p);
                }

                if (ball.direction === null) {
                    ball.direction = playerTurn === "p1" ? false : true;
                    ball.setNewDirection();

                } else {
                    ball.updatePos();

                    // RGB
                    // ball.color = ball.color >= 360 ? 0 : ball.color + 1;

                    if (ball.isOutOfBounds()) {
                        const p = ball.direction === true ? "p2" : "p1";
                        playerTurn = playerTurn === "p1" ? "p2" : "p1";
                        actors.get(p).points++;
                        ball.reset();
                        // console.log(actors.get("p1").points, actors.get("p2").points);
                    }



                }

            }

            // console.log("S", game.current);
            if (lobby && game.current && game.current !== null) {

                // console.log(game.current);

                let host = actors.get("p1");
                let opp = actors.get("p2");

                if (game.current.hostPos !== null)
                    host.y = game.current.hostPos;

                if (game.current.hostPoints !== null)
                    host.points = game.current.hostPoints;

                if (game.current.opponentPos !== null)
                    opp.y = game.current.opponentPos;

                if (game.current.opponentPoints !== null)
                    opp.points = game.current.opponentPoints;

                game.current = null;
            }

            // Draw actors
            actors.forEach(a => {
                a.draw();
            });

            // Draw Points
            const p1p = actors.get("p1").points;
            const p2p = actors.get("p2").points;

            context.font = "64px serif";
            context.fillStyle = "#fff"
            context.fillText(p1p, canvas.width * 0.4, canvas.height * 0.2);
            context.fillText(p2p, canvas.width * 0.6, canvas.height * 0.2);

            animationFrameId = window.requestAnimationFrame(render);
        }

        initPong();
        render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener("mousemove", EOnMouseMove)
        }

    }, [gameHasStarted]);

    // Socket Effect
    useEffect(() => {

        console.log("l", lobby);
        if (!lobby) return;

        // Socket
        const sessionID = localStorage.getItem("sessionID");
        if (sessionID) {
            socket.auth = { sessionID };
        }


        console.log("test");

        if (socket.connected === false)
            socket.connect();
        else {
            if (gameHasStarted === false) {
                socket.emit("playerConnected", lobby);
            }
        }


        function EConnected() {
            if (socket.recovered) {
                // any event missed during the disconnection period will be received now
                console.log("Reconnected to server");
            } else {
                console.log("Connected to server");
                // new or unrecoverable session
            }

            console.log("playerConnected");
            socket.emit("playerConnected", lobby);

            // setState("name");
            setIsConnected(socket.connected);
        }

        function EUpdatePlayers(e) {
            const { hostPos, opponentPos, hostPoints, opponentPoints } = e;

            console.log("E", e);
            game.current = e;

        }

        function ESession(e) {

            const { sessionID, userID, user } = e;
            const { name } = user;
            const serverState = user.state;
            console.log("SS", serverState);
            // console.log(e);
            socket.auth = { sessionID };
            localStorage.setItem("sessionID", sessionID);
            socket.userID = userID;

            console.log("US", name);
            /*
            if (name) {
                socket.username = name;
                setUserName(name);
                setState("mainMenu")
            } else
                setState("name");
            */
        }

        function EDisconnect() {
            setIsConnected(socket.connected);
            // setState("name")
        }

        function EGameCanStart() {
            setGameHasStarted(true);
            console.log("GAME CAN START");
        }

        socket.on("session", ESession);
        socket.on("gameCanStart", EGameCanStart);
        socket.on("updatePlayers", EUpdatePlayers);
        socket.on("disconnect", EDisconnect)
        socket.on("connect", EConnected);

        return () => {
            socket.off("session", ESession);
            socket.off("gameCanStart", EGameCanStart);
            socket.off("updatePlayers", EUpdatePlayers);
            socket.off("disconnect", EDisconnect);
            socket.off("connect", EConnected);
        }

    }, [socket, lobby])

    return (
        <>
            <div style={{ margin: "0", padding: "0", position: "relative" }}>

                {!lobby ?
                    <></>
                    :
                    gameHasStarted === false ?
                        <div style={{
                            position: "absolute",
                            height: "100%", width: "100%",
                            background: "#ffffff80", display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            flexDirection: "column"
                        }}> <h1>Waiting for players ...</h1>
                            <div className='loader' />
                        </div>
                        :
                        <>
                            {/* animation start of a game ig */}
                        </>
                }
                <canvas ref={canvasRef} id="pongGame" width="100%" height="100%" style={{ margin: "0", padding: "0" }}></canvas>
            </div>
        </>
    )
}
