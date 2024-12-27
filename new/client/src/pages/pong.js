import Actor from '@/classes/pongGame/Actor';
import gsap from "gsap";
import Ball from '@/classes/pongGame/Ball';
import Player from '@/classes/pongGame/Player';
import Head from "next/head";
import { socket } from "@/classes/socket";
import { SP } from 'next/dist/shared/lib/utils';
import { useRouter } from 'next/router';
import React, { act, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link';


export default function Pong() {

    // const [lobby, setLobby] = useState(undefined);
    const lobby = useRef(undefined);
    const [isConnected, setIsConnected] = useState(undefined);
    // const [game, setGame] = useState(undefined);
    const [gameHasStarted, setGameHasStarted] = useState(false);
    const [gameHasEnded, setGameHasEnded] = useState(false);
    const router = useRouter();


    // const gameData = useMemo(() => {return game}, [game]);

    let context = undefined;
    let canvas = undefined;
    let devicePixelRatio = undefined;

    let playerTurn = "p1";

    const game = useRef(null);
    const ballPos = useRef(null);
    const points = useRef(null);
    const winner = useRef(null);
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
            lobby.current = undefined;
            return
        }

        let lobbyTmp = {
            isHost: recievedLobby.isHost == "true",
            lobbyName: recievedLobby.lobbyName,
        };

        lobby.current = lobbyTmp;

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
        let sequenceNumber = 0;
        let playerInputs = [];
        let newYPos = undefined;
        let otherPlayerNewPos = undefined;
        let interpolationFrame = 0;
        let interpolationSpeed = 0;
        const SPEED = 12;

        let ball = undefined;
        let host = undefined;
        let opp = undefined;
        // let currentPlayer = undefined;
        // let otherPlayer = undefined;

        function gameLoopInterval() {
            let currentPlayer = actors.get(playerControl);
            if (newYPos && newYPos !== currentPlayer.y) {
                // const speed = Math.abs(p.y - e.y);
                // p.speedQueue.enqueue(speed);
                const oldPos = currentPlayer.y;
                currentPlayer.updatePos(currentPlayer.x, newYPos);

                // console.log("L", lobby.current);
                //  
                if (lobby.current) {
                    //console.log(playerControl, newYPos);
                    sequenceNumber++;
                    // console.log("NEWP:", newYPos);
                    // console.log("PO:", oldPos);
                    // console.log("PN:", p.y);
                    const diff = (currentPlayer.y - oldPos);
                    playerInputs.push({ sequenceNumber, pos: diff });
                    socket.emit("EPong", lobby.current.lobbyName, { event: "mouseMove", value: newYPos }, sequenceNumber);
                }

            }
        };


        setInterval(gameLoopInterval, 15);

        function EOnMouseMove(e) {
            let currentPlayer = actors.get(playerControl);
            if (currentPlayer) {
                // const speed = Math.abs(p.y - e.y);
                // p.speedQueue.enqueue(speed);

                if (isNaN(currentPlayer.y)) {
                    currentPlayer.y = e.y;
                }

                newYPos = e.y;
            }
        }

        canvas.addEventListener("mousemove", EOnMouseMove);

        function initPong() {
            let player1 = new Player("p1", context, devicePixelRatio, canvas.width * 0.05, canvas.height * 0.5);
            let player2 = new Player("p2", context, devicePixelRatio, canvas.width * 0.95, canvas.height * 0.5);
            const ballX = canvas.width / 2;
            const ballY = canvas.height / 2;

            player1.speed = SPEED;
            player2.speed = SPEED;

            actors = new Map();
            actors.set("p1", player1);
            actors.set("p2", player2);
            actors.set("ball", new Ball(context, devicePixelRatio, ballX, ballY));
            ball = actors.get("ball");
            host = actors.get("p1");
            opp = actors.get("p2");

            playerControl = lobby.current && !lobby.current.isHost ? "p2" : "p1";
        }

        let ballColor = 0;

        function render() {


            // console.log(e.elapsedTime);
            context.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;
            drawBg();
            drawMiddleLine();

            // Update Ball new Pos
            if (ball) {

                if (ballPos.current !== null) {
                    // console.log("BALL", ballPos.current.x, ballPos.current.y);

                    ball.x = ballPos.current.x;
                    ball.y = ballPos.current.y;
                    ball.angle = ballPos.current.angle;
                    ball.speed = ballPos.current.speed;

                }

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

            let currentPlayer = actors.get(playerControl);
            let otherPlayer = playerControl === "p1" ? actors.get("p2") : actors.get("p1");

            // THIS IS TO UPDATE THE PLAYER MOVEMENTS WHEN ITS IN MULTIPLAYER
            if (lobby.current && game.current && game.current !== null) {

                if (game.current.hostPos !== null && game.current.opponentPos !== null) {
                    if (lobby.current.isHost === true) {
                        currentPlayer.y = game.current.hostPos;
                        otherPlayerNewPos = game.current.opponentPos;
                    }
                    else {
                        currentPlayer.y = game.current.opponentPos;
                        otherPlayerNewPos = game.current.hostPos;
                    }
                }

                // Start of Player Reconciliation
                const lastServerInputIndex = playerInputs.findIndex(i => {
                    const playerSeq = lobby.current.isHost === true ? game.current.hostSeq : game.current.oppSeq;
                    return playerSeq === i.sequenceNumber;
                });

                if (lastServerInputIndex > -1)
                    playerInputs.splice(0, lastServerInputIndex + 1);

                playerInputs.forEach(i => {
                    currentPlayer.y += i.pos;
                })
                // End of Player Reconciliation

                // Player interpolation for other players
                if (!isNaN(otherPlayer.y) && otherPlayer.y !== otherPlayerNewPos) {
                    //console.log("iif", interpolationSpeed, otherPlayer, otherPlayerNewPos);

                    interpolationFrame = 0;
                    interpolationSpeed = (otherPlayerNewPos - otherPlayer.y) / 5;

                    if (interpolationSpeed > SPEED)
                        interpolationSpeed = SPEED
                    else if (interpolationSpeed < SPEED * -1)
                        interpolationSpeed = SPEED * -1

                    otherPlayerNewPos = undefined;
                } else
                    otherPlayer.y = otherPlayerNewPos;

                game.current = null;


            } else {
                // TODO: IA in solo play
                // use otherPlayer.y property
            }

            // Maybe also for us?
            // Player interpolation for other player
            if (lobby.current && interpolationFrame < 15 && otherPlayer.y !== otherPlayerNewPos) {
                otherPlayer.y += interpolationSpeed;
                interpolationFrame += 3;
            }

            // Draw actors
            actors.forEach(a => {
                a.draw();
            });

            if (points.current !== null) {
                host.points = points.current.host;
                opp.points = points.current.opp;
            }

            // Draw Points
            context.font = "64px serif";
            context.fillStyle = "#fff"
            context.fillText(host.points, canvas.width * 0.4, canvas.height * 0.2);
            context.fillText(opp.points, canvas.width * 0.6, canvas.height * 0.2);

            animationFrameId = window.requestAnimationFrame(render);
        }

        initPong();
        render();

        return () => {
            clearInterval(gameLoopInterval);
            window.cancelAnimationFrame(animationFrameId);
            canvas.removeEventListener("mousemove", EOnMouseMove)
        }

    }, [gameHasStarted]);

    // Socket Effect
    useEffect(() => {

        console.log("l", lobby);
        if (!lobby.current) return;

        // Socket
        const sessionID = localStorage.getItem("sessionID");
        if (sessionID) {
            socket.auth = { sessionID };
        }

        if (socket.connected === false)
            socket.connect();
        else {
            if (gameHasStarted === false) {
                socket.emit("playerConnected", lobby.current);
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
            socket.emit("playerConnected", lobby.current);

            // setState("name");
            setIsConnected(socket.connected);
        }

        function EUpdatePlayers(e) {
            // console.log("g", e);
            game.current = e;

        }

        function EUpdateBall(e) {
            // console.log("b", e);
            ballPos.current = e.ball;

        }

        function EUpdatePoints(e) {
            // console.log("POINTS:", e);
            points.current = e;

        }

        function EFinishGame(e) {
            console.log("GHS", gameHasStarted);

            winner.current = e.winner;
            setGameHasEnded(true);
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
        socket.on("updateBall", EUpdateBall);
        socket.on("updatePoints", EUpdatePoints);
        socket.on("finishGame", EFinishGame);
        socket.on("disconnect", EDisconnect)
        socket.on("connect", EConnected);

        return () => {
            socket.off("session", ESession);
            socket.off("gameCanStart", EGameCanStart);
            socket.off("updatePlayers", EUpdatePlayers);
            socket.off("updateBall", EUpdateBall);
            socket.off("updatePoints", EUpdatePoints);
            socket.off("finishGame", EFinishGame);
            socket.off("disconnect", EDisconnect);
            socket.off("connect", EConnected);
        }

    }, [socket])

    return (
        <>
            <Head>
                {/* <meta name="viewport" content="width=device-width, user-scalable=no, minimum-scale=1.0, maximum-scale=1.0"></meta> */}
            </Head>
            <div style={{ margin: "0", padding: "0", position: "relative" }}>

                {gameHasEnded === true ?
                    <div style={{
                        position: "absolute",
                        height: "100%", width: "100%",
                        background: "#ffffff80", display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column"
                    }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", width: "40%", height: "40%", backgroundColor: "#fff", borderRadius: "4px" }}>
                            <h1>{`The winner is: ${winner.current}`}</h1>
                            <button
                                href="/"
                                className="button"
                                onClick={() => router.push("/", undefined, {shallow: false})}
>
                                Back
                            </button>
                        </div>
                    </div>
                    :
                    lobby.current ? <></> :
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
                            <></>

                }
                <canvas ref={canvasRef} id="pongGame" width="100%" height="100%" style={{ margin: "0", padding: "0" }}></canvas>
            </div >
        </>
    )
}
