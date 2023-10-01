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

            this.angle = -1;
            this.ballSize = 30;
            this.direction = null;
        }

        draw() {
            context.fillStyle = '#ff0000';
            context.fillRect(this.x - (this.ballSize / 2), this.y - (this.ballSize / 2), this.ballSize, this.ballSize);
            context.fill()
        }

        hasCollidedWithWall(newY) {
            return newY - (this.ballSize / 2) <= 0 || newY + (this.ballSize / 2) >= canvas.height;
        }

        hasCollidedWithPlayer(newX, newY, player) {
            // See player collision
            return false;
        }

        updatePos() {
            if (this.angle === -1 || this.direction === null)
                return;

            const speed = 8;
            // 

            // Rad convertion
            // const angleRad = this.angle * (Math.PI / 180 * bXPivot);
            const angleRad = this.angle * (Math.PI / 180);

            const xDelta = Math.cos(angleRad);
            const yDelta = Math.sin(angleRad);

            const newX = this.x + (xDelta * speed);
            const newY = this.y + (yDelta * speed);

            const p = this.direction === true ? "p1" : "p2";

            if (this.hasCollidedWithWall(newY)) {

                console.log(xDelta, yDelta);

                const goDown = newY - (this.ballSize / 2) <= 0 
                
                const angle90 = Math.abs(this.angle % 90);
                let addAngle = 0;
                
                if(this.direction === true)
                    addAngle = goDown ? (90 - angle90) * -2 : angle90 * 2;
                else 
                    addAngle = goDown ? angle90 * 2 : (90 - angle90) * -2;

                this.angle += addAngle;
                this.angle %= 360;
                
                if(Math.sign(this.angle) === 1){
                    this.angle = (360 - this.angle) * -1; 
                }


            } else if (this.hasCollidedWithPlayer(newX, newY, p)) {

            } else {
                this.x = newX;
                this.y = newY;
            }

            // console.log(bXPivot);
        }

        setNewDirection() {
            if (this.direction === null)
                this.direction = true;
            else
                this.direction = !this.direction;

            const bXPivot = this.direction === true ? 180 : 360;

            this.angle = Math.floor(Math.random() * 90) - 45 + (this.direction === true ? 180 : 0);
            this.angle *= -1;
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
