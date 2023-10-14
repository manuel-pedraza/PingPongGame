import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'

import { useEffect, useState } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [userName, setUserName] = useState(undefined);
  const [roomName, setRoomName] = useState(undefined);
  const [state, setState] = useState("name");
  const { socket } = useSocketContext();

  function askName() {
    return (
      <>
        <input type='text' onChange={(e) => {
          setUserName(e.target.value ? e.target.value : "")
        }} />
        <button onClick={(e) => {
          socket.emit("addUser", userName);
        }}>
          Send Name
        </button>
      </>
    );
  }

  function mainMenu() {
    return (
      <>
        <button onClick={(e) => {
          setState("roomName");
        }}>
          Create Room
        </button>
        <button onClick={(e) => {
          setState("roomListMenu");
        }}>
          See Room List
        </button>
      </>
    )
  }

  function askRoomName() {
    return (
      <>
        <input type='text' onChange={(e) => {
          setRoomName(e.target.value ? e.target.value : "")
        }} />
        <button onClick={(e) => {

          socket.emit("createRoom", roomName, userName);
        }}>
          Send Room Name
        </button>
      </>
    )
  }

  function roomListMenu() {
    return (
      <>Hello there</>
    )
  }

  function getActualState() {
    switch (state) {
      case "name":
        return askName();
      case "mainMenu":
        return mainMenu();
      case "roomName":
        return askRoomName();
      case "roomListMenu":
        return roomListMenu();
      default:
        return (<></>);
    }
  }

  useEffect(() => {

    function EUserAlreadyExists() {
      alert("User was already taken")
    }

    function EUserCreated() {
      alert("User created")
      setState("mainMenu");
    }

    function ERoomCreated(){
      alert(`Room ${roomName} created`);
      setState("Await Room");
    }

    function EDisconnect(){
      setState("name")
    }

    socket.on("userAlreadyExists", EUserAlreadyExists);
    socket.on("userCreated", EUserCreated);
    socket.on("roomCreated", ERoomCreated);
    socket.on("disconnect", EDisconnect)
    
    
    return () => {
      socket.off("userAlreadyExists", EUserAlreadyExists);
      socket.off("userCreated", EUserCreated);
      socket.off("roomCreated", ERoomCreated);
      socket.off("disconnect", EDisconnect);
    }

  }, [socket]);

  return (
    <>
      <Head>
      </Head>
      <main>
        <h1 >Hello there</h1>
        {getActualState()}
      </main>
    </>
  )
}
