# Pong Game 
Pong project to get used with sockets and multi-client app.

## File structure
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
There are two type **big** directories. The **new** and **old** directories are two separate type of applications. The two have a server and a client app, but the **old** directory was created as an itroduction to the socket.io library.

```
./
├── new
└── old
```

## Start project

To start a client:
```
npm run dev
```

To start a server: 
```
npm start 
or
node index.js
```
