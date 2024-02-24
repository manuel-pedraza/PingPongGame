
import React from 'react'



export function askName() {
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

export function cantConnectToServer() {
    return (
        <>
            <h1 style={{ color: "#a00" }}>Can't connect to server</h1>
        </>
    )
}

export function mainMenu() {
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

export function askRoomName() {
    return (
        <>
            {btnBackToMenu()}
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

export function roomListMenu() {

    return (
        <>
            {btnBackToMenu()}
            <h1>Room List</h1>
            <ul className='room-list'>
                {roomList.map((r, index) => {
                    console.log("I:", typeof index, (index % 2));
                    return (
                        <li key={`room-${r.name}`} className={`room-list-element${index % 2 === 1 ? " odd" : ""}`} tabIndex="0"
                            onClick={() => {
                                socket.emit("requestJoinRoomByRList", r.name, userName);
                            }}

                            onKeyUp={(e) => {
                                switch (e.key) {
                                    case "Enter":
                                    case "Space":
                                        socket.emit("requestJoinRoomByRList", r.name, userName);

                                        break;
                                    default:
                                        break;
                                }
                            }}
                        >
                            {`Name: ${r.name} | Host: ${r.host}`}
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export function roomLobby() {
    return (<>
        {btnBackToMenu()}

        <h1>{`Lobby: ${roomName}`}</h1>
        <h2 style={{ color: "#f00" }}>{isHost === true ? userName : opponent}</h2>
        <h2>{isHost === false ? userName : opponent}</h2>

        {isHost === true && opponent ?
            <button
                onClick={(e) => {

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

            >Start game</button>
            :

            <></>
        }

    </>)
}
