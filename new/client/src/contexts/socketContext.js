import { createContext, useContext } from "react"

const SocketContext = createContext();
import { socket } from "@/classes/socket";
let connected = undefined;


export function SocketProvider({ children }) {

    function tryToConnect(){
        return connected;
    }

    socket.on("disconnect", () => {
        connected = false;
        console.log("DISCONNECTED");
    });


    socket.on("message_error", (error) => {
        console.log("ERROR_MSG");
        connected = false;

    });

    socket.on("connect", () => {


        if (socket.recovered) {
            // any event missed during the disconnection period will be received now
            console.log("Reconnected to server");
        } else {
            console.log("Connected to server");
            // new or unrecoverable session
        }

        connected = true;

        console.log("CONTEXT: ", connected);
    });

    // value = {{ socket, connected, tryToConnect }}
    return <SocketContext.Provider value={{}}>
        {children}
    </SocketContext.Provider>
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within an I18NProvider")
    }
    // socket.connect();

    return context;
}