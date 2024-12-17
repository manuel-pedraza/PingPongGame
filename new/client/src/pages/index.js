import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import { useSocketContext } from '@/contexts/socketContext'
import { AskName, AskRoomParams, CantConnectToServer, RoomListMenu, MainMenu, RoomLobby } from "@/components/MainMenuList";

import { useEffect, useMemo, useState } from 'react';
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
  const [roomPoints, setRoomPoints] = useState(undefined);
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

  const getActualState = useMemo(() => {
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
            setState("roomParams");
          }}

          roomListOnClick={() => {
            socket.emit("requestRoomList");
            setState("roomListMenu");

          }}
        />;
      case "roomParams":
        return <AskRoomParams btnBackToMenu={btnBackToMenu}
          roomNameOnChangeEvent={(e) => {
            setRoomName(e.target.value ? e.target.value : "");
          }}

          roomPointsOnChangeEvent={(e) => {
            setRoomPoints(e.target.value ? e.target.value : 10);
          }}


          createRoomOnClickEvent={(e) => {
            socket.emit("createRoom", roomName, userName, roomPoints);
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
              lobbyName: roomName
            };

            const devicePixelRatio = window.devicePixelRatio || 1;
            const height = window.innerHeight * devicePixelRatio;
            const width = window.innerWidth * devicePixelRatio;
            socket.emit("startGame", roomName, { x: width, y: height});
            // alert("game started");
            router.push({ pathname: "/pong", query: lobby });

          }}
        />;
      default:

        return (<></>);
    }
  }, [roomList, state, opponent, roomPoints, roomName, userName])

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

    const intervalIsNotConnected = () => {
      if (socket.connected === false) {
        setIsConnected(socket.connected);
        setState("cantConnectToServer");
      }
    };

    setInterval(intervalIsNotConnected, 12000);
    // console.log(socket);

    function EErrorCreatingRoom(args) {
      alert(args);
    }

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

    function EOpponentLeft(args) {
      setOpponent(undefined);
    }

    function EGameCancelled(args) {
      setState("roomListMenu");
      socket.emit("requestRoomList");

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

    function WEOnload(e) {
      socket.connect();
    }

    if (document.readyState === "complete")
      WEOnload();
    else
      window.addEventListener("load", WEOnload);


    socket.on("errorAddingUser", EErrorAddingUser);
    socket.on("errorCreatingRoom", EErrorCreatingRoom);
    socket.on("userCreated", EUserCreated);
    socket.on("roomCreated", ERoomCreated);
    socket.on("newRoomCreated", ENewRoomCreated);
    socket.on("requestRoomList", EGetRoomList);
    socket.on("errorJoiningRoom", EErrorJoiningRoom);
    socket.on("joinedRoomFromList", EJoinedRoomByList);
    socket.on("opponentJoined", EOpponentJoined);
    socket.on("opponentLeft", EOpponentLeft);
    socket.on("gameCancelled", EGameCancelled);
    socket.on("startedGame", EStartedGame);
    socket.on("session", ESession);
    socket.on("disconnect", EDisconnect)
    socket.on("connect", EConnected);
    socket.on("message_error", EMsgError);


    return () => {
      window.removeEventListener("load", WEOnload);
      clearInterval(intervalIsNotConnected);

      socket.off("errorAddingUser", EErrorAddingUser);
      socket.off("errorCreatingRoom", EErrorCreatingRoom);
      socket.off("session", ESession);
      socket.off("userCreated", EUserCreated);
      socket.off("roomCreated", ERoomCreated);
      socket.off("newRoomCreated", ENewRoomCreated);
      socket.off("requestRoomList", EGetRoomList);
      socket.off("errorJoiningRoom", EErrorJoiningRoom);
      socket.off("joinedRoomFromList", EJoinedRoomByList);
      socket.off("opponentJoined", EOpponentJoined);
      socket.off("opponentLeft", EOpponentLeft);
      socket.off("gameCancelled", EGameCancelled);
      socket.off("startedGame", EStartedGame);
      socket.off("disconnect", EDisconnect);
      socket.off("connect", EConnected);
      socket.off("message_error", EMsgError);
    }


  }, [socket, roomList]);

  return (
    <>
      <Head>
      </Head>
      <main>
        <div>
          <h1>Hello there</h1>
          {
            !(state === "name" || state === "cantConnectToServer") && userName !== undefined ?
              <h2>{userName}</h2>
              :
              <></>
          }

          {getActualState}
        </div>
      </main>
    </>
  )
}


