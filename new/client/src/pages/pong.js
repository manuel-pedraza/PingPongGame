import { Plaster } from 'next/font/google';
import React, { useEffect, useRef } from 'react'

export default function Pong() {

    const canvasRef = useRef(null);

    const drawBg = (ctx, canvas) => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fill()

    }

    const drawPlayer = (ctx, player) => {
        console.log(player.x - (player.width / 2), player.y - (player.height / 2), player.width, player.height);
        ctx.fillStyle = '#fff';
        // ctx.fillRect(200, 200, 100, 100);
        ctx.fillRect(player.x - (player.width / 2), player.y - (player.height / 2), player.width, player.height);
        ctx.fill();

    }

    useEffect(() => {

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        let frameCount = 0;
        let animationFrameId;


        class Player{
            constructor(x, y){
                this.x = x;
                this.y = y;

                this.height = 150;
                this.width = 50;
            }
        }

        let player1 = new Player(canvas.width * 0.2, context.canvas.height * 0.5);
        let player2 = new Player(canvas.width * 0.8, context.canvas.height * 0.5);

        console.log(player1, player2);

        function render(){
            context.clearRect(0, 0, canvas.width, canvas.height);
            frameCount++;
            drawBg(context, canvas);

            // console.log(player1.x, player1.y);

            drawPlayer(context, player1);
            drawPlayer(context, player2);
            animationFrameId = window.requestAnimationFrame(render);
        }

            render();

        return () => {
            window.cancelAnimationFrame(animationFrameId);
        }

    }, []);

    return (
        <>
            <div>
                <canvas ref={canvasRef} id="pongGame" width="1800" height="800" style={{margin: "0"}}>

                </canvas>
            </div>
        </>
    )
}
