import Actor from '@/classes/pongGame/Actor';
import Ball from '@/classes/pongGame/Ball';
import Player from '@/classes/pongGame/Player';
import { Plaster } from 'next/font/google';
import React, { useEffect, useRef } from 'react'

export default function Pong() {
    let context = undefined;
    let canvas = undefined;

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

        context.fillStyle = "#fff";

        const squaresToDraw = height / squareSize / 2;

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

            if (p !== undefined)
                p.updatePos(p.x, e.y);
        }

        canvas.addEventListener("mousemove", mouseMoveHandler);

        // console.log(player1, player2);

        function initPong() {
            let player1 = new Player("p1", context, canvas.width * 0.05, context.canvas.height * 0.5);
            let player2 = new Player("p2", context, canvas.width * 0.95, context.canvas.height * 0.5);
            let ball = new Ball(context, canvas.width / 2, canvas.height / 2);

            // console.log(ball);

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
                if (ball.direction === null) {

                    // console.log(ball.angle);
                    
                    ball.setNewDirection();
                    console.log(ball.angle);
                }
                else {
                    ball.updatePos()
                }

            }

            // Draw actors
            actors.forEach(a => {
                console.log(a);
                a.draw();
            });

            // drawPlayer(context, player1);
            // drawPlayer(context, player2);

            //drawBall(context, ball);

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
                <canvas ref={canvasRef} id="pongGame" width="1800" height="800" style={{ margin: "0" }}>

                </canvas>
            </div>
        </>
    )
}
