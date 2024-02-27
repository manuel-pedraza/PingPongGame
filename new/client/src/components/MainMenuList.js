
import React from 'react'

export function AskName({ onChange, onClick }) {
    return (
        <div>
            <input type='text' onChange={(e) => {
                onChange?.(e);
            }} />
            <button onClick={(e) => {
                onClick?.(e);

            }}>
                Send Name
            </button>
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
        <>
            <button onClick={(e) => {

                createRoomOnClick?.();

            }}>
                Create Room
            </button>
            <button onClick={(e) => {
                roomListOnClick?.();


            }}>
                See Room List
            </button>
        </>
    )
}

export function AskRoomName({ btnBackToMenu, roomNameOnChangeEvent, createRoomOnClickEvent }) {
    return (
        <>
            {btnBackToMenu()}
            <input type='text' onChange={(e) => {


                roomNameOnChangeEvent?.(e);


            }} />
            <button onClick={(e) => {
                createRoomOnClickEvent?.();

            }}>
                Send Room Name
            </button>
        </>
    )
}

export function RoomListMenu({ btnBackToMenu, roomList, joinRoom }) {

    return (
        <>
            {btnBackToMenu()}
            <h1>Room List</h1>
            <ul className='room-list'>
                {roomList.map((r, index) => {
                    console.log("I:", typeof index, (index % 2));
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
                            {`Name: ${r.name} | Host: ${r.host}`}
                        </li>
                    )
                })}
            </ul>
        </>
    )
}

export function RoomLobby({ btnBackToMenu, isHost, roomName, userName, opponent, startOnClick }) {
    return (<>
        {btnBackToMenu()}

        <h1>{`Lobby: ${roomName}`}</h1>
        <h2 style={{ color: "#f00" }}>{isHost === true ? userName : opponent}</h2>
        <h2>{isHost === false ? userName : opponent}</h2>

        {isHost === true && opponent ?
            <button
                onClick={(e) => {
                    startOnClick?.(e);

                    
                }}

            >Start game</button>
            :

            <></>
        }

    </>)
}
