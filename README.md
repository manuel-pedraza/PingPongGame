# Pong Game

A multiplayer Pong game built with **Socket.io**, designed to enhance familiarity with real-time socket connections and multi-client applications.

## Features
- **Real-time multiplayer** using WebSockets.
- **Lobby system** to manage player connections.
- **Queue system** for organizing matches.
- **Modular structure** with separate client and server directories.
- **Styled UI** with reusable components.

## File Structure
```
./
├── new
│   ├── client
│   │   └── src
│   │       ├── classes
│   │       │   ├── Queue.js
│   │       │   ├── pongGame
│   │       │   │   ├── Actor.js
│   │       │   │   ├── Ball.js
│   │       │   │   └── Player.js
│   │       │   └── socket.js
│   │       ├── components
│   │       │   └── MainMenuList.js
│   │       ├── contexts
│   │       │   └── socketContext.js
│   │       ├── pages
│   │       │   ├── _app.js
│   │       │   ├── _document.js
│   │       │   ├── index.js
│   │       │   └── pong.js
│   │       └── styles
│   │           ├── Home.module.css
│   │           └── globals.css
│   └── server
│       ├── classes
│       │   ├── Ball.js
│       │   ├── Consts.js
│       │   ├── Game.js
│       │   ├── Lobby.js
│       │   ├── User.js
│       │   └── sessionStore.js
│       ├── enums
│       │   └── userStates.js
│       └── index.js
└── old
    ├── client
    │   ├── classes
    │   │   └── Lobby.js
    │   └── index.js
    └── server
        ├── classes
        │   ├── Lobby.js
        │   └── User.js
        └── index.js
```

The project contains two main directories:
- **`new/`** - The latest version of the Pong game, with an improved architecture.
- **`old/`** - The initial implementation created as an introduction to **Socket.io**.

## Installation & Setup

### Install dependencies
Before running the project, install the required dependencies:
```bash
npm install
```

### Start the Client
Run the client development server:
```bash
npm run dev
```

### Start the Server
Start the server using either of the following commands:
```bash
npm start 
# or
node index.js
```

## Technologies Used
- **Node.js** - Backend runtime
- **Socket.io** - WebSockets for real-time communication
- **Next.js** - Frontend framework
- **React.js** - Frontend framework


## Author
Developed by Manuel A. Pedraza S.
