import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'

import { useEffect, useState } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] })
import { socket } from "@/classes/socket";
import { useRouter } from 'next/router'; 


export default function Home() {

  const router = useRouter()
  
  const [isConnected, setIsConnected] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [opponent, setOpponent] = useState(undefined);
  const [roomName, setRoomName] = useState(undefined);
  const [isHost, setIsHost] = useState(false);
  const [state, setState] = useState("name");
  const [rommList, setRoomList] = useState([]);

  function askName() {
    return (
      <div>
        <input type='text' onChange={(e) => {
          setUserName(e.target.value ? e.target.value : "")
        }} />
        <button onClick={(e) => {
          try {
            // socket.auth = { username: userName};

            socket.emit("addUser", userName);
          } catch (error) {

          }

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
          socket.emit("requestRoomList");
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
      <>
        <h1>Room List</h1>
        <ul className='room-list'>
          {rommList.map((r, index) => {
            console.log("I:", typeof index, (index % 2));
            return (
              <li key={`room-${r.name}`} className={`room-list-element${index % 2 === 1 ? " odd" : ""}`}
                onClick={() => {
                  socket.emit("requestJoinRoomByRList", r.name, userName);
                }}

              >
                {`Name: ${r.name} | Host: ${r.host}`}
              </li>)
          })}
        </ul>
      </>
    )
  }

  function roomLobby() {
    return (<>
      <h1>{`Lobby: ${roomName}`}</h1>
      <h2 style={{ color: "#f00" }}>{isHost === true ? userName : opponent}</h2>
      <h2>{isHost === false ? userName : opponent}</h2>

      {isHost === true && opponent !== undefined ?
        <button
          onClick={(e) => {

            let lobby = {
              isHost: isHost,
              lobbyName: roomName,
              host: userName,
              opponent: opponent
            };

            socket.emit("startGame", roomName, {...lobby, isHost: false});

            alert("game started");
          
            router.push({pathname: "/pong", query: lobby});

          }}
        >Start game</button>
        :

        <></>
      }

    </>)
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
      case "awaitRoom":
        return roomLobby();
      default:

        return (<></>);
    }
  }

  useEffect(() => {
    if (isConnected === false)
      setState("cantConnectToServer");

    console.log(isConnected);
  }, [isConnected]);

  useEffect(() => {
    const sessionID = localStorage.getItem("sessionID");

    if (sessionID) {
      socket.auth = { sessionID };
    }

    socket.connect();
    // console.log(socket);


    function EErrorAddingUser(args) {
      alert(args);
    }

    function EErrorJoiningRoom(args) {
      alert(args);
    }

    function EJoinedRoomByList(args) {
      setIsHost(false);
      setRoomName(args.name);
      setOpponent(args.host);
      setState("awaitRoom");
    }

    function EOpponentJoined(args) {
      setOpponent(args.opponent);
    }

    function EUserCreated() {
      alert("User created")
      setState("mainMenu");
    }

    function ERoomCreated(lobby) {
      alert(`Room ${lobby.name} created`);
      setIsHost(true);
      setState("awaitRoom");
    }

    function EConnected() {
      if (socket.recovered) {
        // any event missed during the disconnection period will be received now
        console.log("Reconnected to server");
      } else {
        console.log("Connected to server");
        // new or unrecoverable session
      }

      setState("name");
      setIsConnected(socket.connected);
    }

    function EStartedGame(lobby){

      console.log(lobby);
      router.push({ pathname: "/pong", query: lobby });

    }

    function ESession(e) {

      const { sessionID, userID, username } = e;
      // console.log(e);
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;

      console.log("US", username);
      if (username) {
        socket.username = username;
        setUserName(username);
        setState("mainMenu")
      } else
        setState("name");

    }

    function EDisconnect() {
      setIsConnected(socket.connected);
      setState("name")
    }

    function EMsgError() {
      setIsConnected(socket.connected);

      console.log(error);
    }

    function EGetRoomList(list) {
      setRoomList(list);
    }


    socket.on("errorAddingUser", EErrorAddingUser);
    socket.on("userCreated", EUserCreated);
    socket.on("roomCreated", ERoomCreated);
    socket.on("requestRoomList", EGetRoomList);
    socket.on("errorJoiningRoom", EErrorJoiningRoom);
    socket.on("joinedRoomFromList", EJoinedRoomByList);
    socket.on("opponentJoined", EOpponentJoined);
    socket.on("startedGame", EStartedGame);
    socket.on("session", ESession);
    socket.on("disconnect", EDisconnect)
    socket.on("connected", EConnected);
    socket.on("message_error", EMsgError);
    
    
    return () => {
      socket.off("errorAddingUser", EErrorAddingUser);
      socket.off("session", ESession);
      socket.off("userCreated", EUserCreated);
      socket.off("roomCreated", ERoomCreated);
      socket.off("requestRoomList", EGetRoomList);
      socket.off("errorJoiningRoom", EErrorJoiningRoom);
      socket.off("joinedRoomFromList", EJoinedRoomByList);
      socket.off("opponentJoined", EOpponentJoined);
      socket.off("startedGame", EStartedGame);
      socket.off("disconnect", EDisconnect);
      socket.off("connected", EConnected);
      socket.off("message_error", EMsgError);
    }


  }, [socket]);

  return (
    <>
      <Head>
      </Head>
      <main>
        <div>
          <h1 >Hello there</h1>
          {
            !(state === "name" || state === "cantConnectToServer") && userName !== undefined ?
              <h2>{userName}</h2>
              :
              <></>
          }

          {getActualState()}
        </div>
      </main>
    </>
  )
}


