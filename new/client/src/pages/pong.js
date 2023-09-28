import { Plaster } from 'next/font/google';
import React, { useEffect, useRef } from 'react'

export default function Pong() {
    let context = undefined;


    const canvasRef = useRef(null);

    const drawBg = (ctx, canvas) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill()

    }

    const drawMiddleLine = (ctx, middle, height) => {

        const squareSize = 10;

        ctx.fillStyle = "#fff";

        const squaresToDraw = height / squareSize / 2;

        for (let i = 0; i <= squaresToDraw; i++) {
            ctx.fillRect(middle - (squareSize / 2), i * squareSize + (i * squareSize) - (squareSize / 2), squareSize, squareSize);
            ctx.fill();
        }
    }

    useEffect(() => {

        const canvas = canvasRef.current;
        context = canvas.getContext("2d");
        let frameCount = 0;
        let animationFrameId;

        class Actor {
            constructor(x, y) {
                this.x = x;
                this.y = y;
            }

            draw() {

            }

            updatePos(x, y) {
                this.x = x;
                this.y = y;
            }
        }

        class Player extends Actor {
            constructor(name, x, y) {
                super(x, y);
                this.name = name;

                this.height = 150;
                this.width = 30;
            }

            draw() {
                context.fillStyle = '#fff';
                // ctx.fillRect(200, 200, 100, 100);
                context.fillRect(this.x - (this.width / 2), this.y - (this.height / 2), this.width, this.height);
                context.fill();
            }

        }

        class Ball extends Actor {
            constructor(x, y) {
                super(x, y);

                this.ballSize = 30;
                this.direction = null;
            }

            draw() {
                context.fillStyle = '#ff0000';
                context.fillRect(this.x - (this.ballSize / 2), this.y - (this.ballSize / 2), this.ballSize, this.ballSize);
                context.fill()
            }
        }

        let actors = undefined;

        const mouseMoveHandler = (e) => {
            let p = actors.get("p1");

            if (p !== undefined)
                p.updatePos(p.x, e.y);
        }

        canvas.addEventListener("mousemove", mouseMoveHandler);

        // console.log(player1, player2);

        function initPong() {
            let player1 = new Player("p1", canvas.width * 0.12, context.canvas.height * 0.5);
            let player2 = new Player("p2", canvas.width * 0.88, context.canvas.height * 0.5);
            let ball = new Ball(canvas.width / 2, canvas.height / 2);

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
            drawBg(context, canvas);
            drawMiddleLine(context, canvas.width / 2, canvas.height);

            // Update Ball new Pos
            let ball = actors.get("ball");
            if (ball !== undefined) {
                const bX = ball.x, bY = ball.Y;

                if (ball.direction === null)
                    ball.direction = true;
                else {
                    const bXPivot = ball.direction === true ? -1 : 1;
                }

            }

            // Draw actors
            actors.forEach(a => {
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
