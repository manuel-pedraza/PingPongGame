import { createContext, useContext } from "react"

const SocketContext = createContext();
import { socket } from "@/classes/socket";


export function SocketProvider({ children }) {
    socket.on("connect", () => {

        if (socket.recovered) {
            // any event missed during the disconnection period will be received now
            console.log("Reconnected to server");
        } else {
            console.log("Connected to server");
            // new or unrecoverable session
        }

    });

    socket.on("disconnect", () => {
        console.log("DISCONNECTED");
    })

    
    return <SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within an I18NProvider")
    }
    socket.connect();

    return context;
}