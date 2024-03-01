import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'
import { AskName, AskRoomName, CantConnectToServer, RoomListMenu, MainMenu, RoomLobby } from "@/components/MainMenuList";

import { useEffect, useState } from 'react';
// var socket = undefined;

const inter = Inter({ subsets: ['latin'] });
import { socket } from "@/classes/socket";
import { useRouter } from 'next/router';


export default function Home() {

  const router = useRouter();

  const [isConnected, setIsConnected] = useState(undefined);
  const [userName, setUserName] = useState(undefined);
  const [opponent, setOpponent] = useState(undefined);
  const [roomName, setRoomName] = useState(undefined);
  const [isHost, setIsHost] = useState(false);
  const [state, setState] = useState("name");
  const [roomList, setRoomList] = useState([]);

  function btnBackToMenu() {
    return (
      <button onClick={(e) => {
        socket.emit("mainMenu");
        setState("mainMenu")
      }}>
        Menu
      </button>
    )
  }

  function getActualState() {
    // const connection = tryToConnect();
    console.log("STATE: ", state);
    switch (state) {
      case "name":
        return <AskName
          onChange={(e) => {
            setUserName(e.target.value ? e.target.value : "")

          }}

          onClick={(e) => {
            try {
              // socket.auth = { username: userName};

              socket.emit("addUser", userName);
            } catch (error) {

            }
          }}
        />;
      case "mainMenu":
        return <MainMenu
          createRoomOnClick={() => {
            setState("roomName");
          }}

          roomListOnClick={() => {
            socket.emit("requestRoomList");
            setState("roomListMenu");

          }}
        />;
      case "roomName":
        return <AskRoomName btnBackToMenu={btnBackToMenu}
          roomNameOnChangeEvent={(e) => {
            setRoomName(e.target.value ? e.target.value : "");
          }}

          createRoomOnClickEvent={(e) => {
            socket.emit("createRoom", roomName, userName);
          }}
        />;
      case "roomListMenu":
        return <RoomListMenu roomList={roomList} btnBackToMenu={btnBackToMenu}
          joinRoom={(e, room) => {
            socket.emit("requestJoinRoomByRList", room, userName);

          }}
        />;
      case "cantConnectToServer":
        return <CantConnectToServer />;
      case "awaitRoom":
        return <RoomLobby btnBackToMenu={btnBackToMenu} roomName={roomName} isHost={isHost} opponent={opponent} userName={userName}
          startOnClick={(e) => {

            let lobby = {
              isHost: isHost,
              lobbyName: roomName,
              host: userName,
              opponent: opponent
            };

            socket.emit("startGame", roomName, { ...lobby, isHost: false });

            alert("game started");

            router.push({ pathname: "/pong", query: lobby });

          }}
        />;
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

    function ENewRoomCreated(resLobby) {
      setRoomList(roomList.concat(resLobby));
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

    function EStartedGame(lobby) {

      console.log(lobby);
      router.push({ pathname: "/pong", query: lobby });

    }

    function ESession(e) {

      const { sessionID, userID, user } = e;
      const { name } = user;
      const serverState = user.state;
      console.log("SS", serverState);
      // console.log(e);
      socket.auth = { sessionID };
      localStorage.setItem("sessionID", sessionID);
      socket.userID = userID;

      console.log("US", name);
      if (name) {
        socket.username = name;
        setUserName(name);
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
    socket.on("newRoomCreated", ENewRoomCreated);
    socket.on("requestRoomList", EGetRoomList);
    socket.on("errorJoiningRoom", EErrorJoiningRoom);
    socket.on("joinedRoomFromList", EJoinedRoomByList);
    socket.on("opponentJoined", EOpponentJoined);
    socket.on("startedGame", EStartedGame);
    socket.on("session", ESession);
    socket.on("disconnect", EDisconnect)
    socket.on("connect", EConnected);
    socket.on("message_error", EMsgError);


    return () => {
      socket.off("errorAddingUser", EErrorAddingUser);
      socket.off("session", ESession);
      socket.off("userCreated", EUserCreated);
      socket.off("roomCreated", ERoomCreated);
      socket.off("newRoomCreated", ENewRoomCreated);
      socket.off("requestRoomList", EGetRoomList);
      socket.off("errorJoiningRoom", EErrorJoiningRoom);
      socket.off("joinedRoomFromList", EJoinedRoomByList);
      socket.off("opponentJoined", EOpponentJoined);
      socket.off("startedGame", EStartedGame);
      socket.off("disconnect", EDisconnect);
      socket.off("connect", EConnected);
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


