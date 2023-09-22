import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import { useSocketContext } from '@/contexts/socketContext'

import { useEffect } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  useEffect(() => {
    // function socketInit() {
    //   socket = io();

    //   socket.on("connect", () => {
    //     console.log("Connected to server");
    //   });
    // };

    // socketInit()

    return () => {
      
    }

  }, [])

  return (
    <>
      <Head>
      </Head>
      <main>
        
      </main>
    </>
  )
}
