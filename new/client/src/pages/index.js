import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'

import { useEffect, useState } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] })
import { socket } from "@/classes/socket";

export default function Home() {
  socket.connect();

  const [isConnected, setIsConnected] = useState(true);
  const [userName, setUserName] = useState(undefined);
  const [roomName, setRoomName] = useState(undefined);
  const [state, setState] = useState("name");


  socket.on("disconnect", () => {
    setIsConnected(false);

    console.log("DISCONNECTED");
  });


  socket.on("message_error", (error) => {
    setIsConnected(false);

    console.log(error);
  });

  socket.on("connect", () => {


    if (socket.recovered) {
      // any event missed during the disconnection period will be received now
      console.log("Reconnected to server");
    } else {
      console.log("Connected to server");
      // new or unrecoverable session
    }
    setIsConnected(true);

  });

  function askName() {
    return (
      <div>
        <input type='text' onChange={(e) => {
          setUserName(e.target.value ? e.target.value : "")
        }} />
        <button onClick={(e) => {
          socket.emit("addUser", userName);
        }}>
          Send Name
        </button>
      </div>
    );
  }

  function cantConnectToServer() {
    return (
      <>
        <h1 style={{ color: "#a00" }}>Can't connect to server</h1>
      </>
    )
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
    // const connection = tryToConnect();
    console.log("STATE: ", state);
    switch (state) {
      case "name":
        return askName();
      case "mainMenu":
        return mainMenu();
      case "roomName":
        return askRoomName();
      case "roomListMenu":
        return roomListMenu();
      case "cantConnectToServer":
        return cantConnectToServer();
      default:

        return (<></>);
    }
  }

  useEffect(() => {

    if (isConnected !== true)
      setState("cantConnectToServer");
    else
      setState("name");

    console.log(isConnected);
  }, [isConnected]);

  useEffect(() => {

    function EUserAlreadyExists() {
      alert("User was already taken")
    }

    function EUserCreated() {
      alert("User created")
      setState("mainMenu");
    }

    function ERoomCreated() {
      alert(`Room ${roomName} created`);
      setState("Await Room");
    }

    function EDisconnect() {
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
        <div>
          <h1 >Hello there</h1>
          {getActualState()}
        </div>
      </main>
    </>
  )
}
