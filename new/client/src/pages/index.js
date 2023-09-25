import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'

import { useEffect, useState } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [userName, setUserName] = useState("");

  const { socket } = useSocketContext();

  useEffect(() => {

    function EUserAlreadyExists() {
      alert("User was already taken")
    }
    
    function EUserCreated() {
      alert("User created")

    }

    socket.on("userAlreadyExists", EUserAlreadyExists);
    socket.on("userCreated", EUserCreated);


    return () => {
      socket.off("userAlreadyExists", EUserAlreadyExists);
      socket.off("userCreated", EUserCreated);
    }

  }, [])

  return (
    <>
      <Head>
      </Head>
      <main>
        <h1 >Hello there</h1>
        <input type='text' onChange={(e) => {
          setUserName(e.target.value ? e.target.value : "")
        }} />
        <button onClick={(e) => {
          socket.emit("addUser", userName);
        }}>
          Send Name
        </button>
      </main>
    </>
  )
}
