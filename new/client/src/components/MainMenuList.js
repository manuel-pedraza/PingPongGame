
import React from 'react'

export function AskName({ onChange, onClick }) {
    return (
        <div>
            <h2>Enter your name: </h2>
            <input type='text' onChange={(e) => {
                onChange?.(e);
            }} />
            <div style={{ display: 'flex', justifyContent: "center", alignItems: "center", flexDirection: "column", margin: "8px" }}>
                <button onClick={(e) => {
                    onClick?.(e);
                }}>
                    Send Name
                </button>
            </div>
        </div>
    );
}

export function CantConnectToServer() {
    return (
        <>
            <h1 style={{ color: "#a00" }}>Can't connect to server</h1>
        </>
    )
}

export function MainMenu({ createRoomOnClick, roomListOnClick }) {
    return (
        <div style={{ display: "flex", flexDirection: "column" }}>
            <button style={{ marginBottom: "12px" }} onClick={(e) => {

                createRoomOnClick?.();

            }}>
                Create Room
            </button>
            <button onClick={(e) => {
                roomListOnClick?.();


            }}>
                See Room List
            </button>
        </div>
    )
}

export function AskRoomParams({ btnBackToMenu, roomNameOnChangeEvent, roomPointsOnChangeEvent, createRoomOnClickEvent }) {
    return (
        <div >
            {btnBackToMenu()}

            <div style={{ display: "flex", flexDirection: "column" }}>
                <h2>Room name:</h2>
                <input type='text' onChange={(e) => {
                    roomNameOnChangeEvent?.(e);
                }} />

                <h2>Points:</h2>
                <input type='text' onChange={(e) => {


                    roomPointsOnChangeEvent?.(e);


                }} />
                <button style={{marginTop: "12px"}} onClick={(e) => {
                    createRoomOnClickEvent?.();

                }}>
                    Send room parameters
                </button>
            </div>
        </div>
    )
}

export function RoomListMenu({ btnBackToMenu, roomList, joinRoom }) {

    return (
        <div>
            {btnBackToMenu()}
            <h1>Room List</h1>
            <ul className='room-list' style={{ overflowY: "scroll", minHeight: "24px", maxHeight: "60vh", minWidth: "75vw" }}>
                {roomList.map((r, index) => {
                    return (
                        <li key={`room-${r.name}`} className={`room-list-element${index % 2 === 1 ? " odd" : ""}`} tabIndex="0"
                            onClick={(e) => {
                                joinRoom?.(e, r.name);
                            }}

                            onKeyUp={(e) => {
                                switch (e.key) {
                                    case "Enter":
                                    case "Space":
                                        joinRoom?.(e, r.name);

                                        break;
                                    default:
                                        break;
                                }
                            }}
                        >
                            {`Name: ${r.name} | Host: ${r.host} | Points: ${r.points}`}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}

export function RoomLobby({ btnBackToMenu, isHost, roomName, userName, opponent, startOnClick }) {
    return (<>
        {btnBackToMenu()}

        <h1>{`Lobby: ${roomName}`}</h1>
        <h2 style={{ color: "#f00" }}>Host: {isHost === true ? userName : opponent}</h2>
        <h2>Opponent: {isHost === false ? userName : opponent}</h2>

        {isHost === true  ?
            opponent ?
            <button
                onClick={(e) => {
                    startOnClick?.(e);


                }}

            >Start game</button>
                : <></>
            :
            <h5 style={{color: "#555"}}>Wait for the host to start the game</h5>
        }

    </>)
}
