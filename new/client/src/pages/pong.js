import Actor from '@/classes/pongGame/Actor';
import Ball from '@/classes/pongGame/Ball';
import Player from '@/classes/pongGame/Player';
import React, { useEffect, useRef } from 'react'

export default function Pong() {
    let context = undefined;
    let canvas = undefined;

    let playerTurn = "p1";

    const canvasRef = useRef(null);

    const drawBg = () => {
        context.fillStyle = '#000000';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fill()

    }

    const drawMiddleLine = () => {

        const middle = canvas.width / 2;
        const height = canvas.height;
        const squareSize = 10;
        const squaresToDraw = height / squareSize / 2;

        context.fillStyle = "#fff";

        for (let i = 0; i <= squaresToDraw; i++) {
            context.fillRect(middle - (squareSize / 2), i * squareSize + (i * squareSize) - (squareSize / 2), squareSize, squareSize);
            context.fill();
        }
    }

    useEffect(() => {

        canvas = canvasRef.current;
        context = canvas.getContext("2d");
        let frameCount = 0;
        let animationFrameId;
        let actors = undefined;

        const mouseMoveHandler = (e) => {
            let p = actors.get("p1");

            if (p !== undefined) {
                const speed = Math.abs(p.y - e.y);
                p.speedQueue.enqueue(speed);
                p.updatePos(p.x, e.y);
            }
        }

        canvas.addEventListener("mousemove", mouseMoveHandler);

        function initPong() {
            let player1 = new Player("p1", context, canvas.width * 0.05, context.canvas.height * 0.5);
            let player2 = new Player("p2", context, canvas.width * 0.95, context.canvas.height * 0.5);
            let ball = new Ball(context, canvas.width / 2, canvas.height / 2);

            actors = new Map();
            actors.set("p1", player1);
            actors.set("p2", player2);
            actors.set("ball", ball);

        }

        function render() {
            // console.log(e.elapsedTime);
            context.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;
            drawBg();
            drawMiddleLine();

            // Update Ball new Pos
            let ball = actors.get("ball");
            if (ball !== undefined) {

                if (ball.player === undefined && ball.direction !== null) {
                    const p = ball.direction === true ? "p1" : "p2";
                    // console.log(playerTurn, ball.direction, p);
                    ball.player = actors.get(p);
                }

                if (ball.direction === null) {
                    ball.direction = playerTurn === "p1" ? false : true;
                    ball.setNewDirection();
                    
                }else {
                    ball.updatePos()

                    if (ball.isOutOfBounds()) {
                        const p = ball.direction === true ? "p2" : "p1";
                        playerTurn = playerTurn === "p1" ? "p2" : "p1";
                        actors.get(p).points++;
                        ball.reset();
                        // console.log(actors.get("p1").points, actors.get("p2").points);
                    }


                }

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
            canvas.removeEventListener("mousemove", mouseMoveHandler)
        }

    }, []);

    return (
        <>
            <div>
                <canvas ref={canvasRef} id="pongGame" width="1800" height="800" style={{ margin: "0" }}></canvas>
            </div>
        </>
    )
}
