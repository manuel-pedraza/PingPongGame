import { createContext, useContext } from "react"

const SocketContext = createContext();
import { socket } from "@/classes/socket";


export function SocketProvider({ children }) {
    let connected = false;

    socket.on("connect", () => {

        connected = true;
        
        if (socket.recovered) {
            // any event missed during the disconnection period will be received now
            console.log("Reconnected to server");
        } else {
            console.log("Connected to server");
            // new or unrecoverable session
        }
        
    });
    
    socket.on("disconnect", () => {
        connected = false;
        console.log("DISCONNECTED");
    });
    
    
    socket.on("message_error", (error) => {
        connected = false;

    });
    
    return <SocketContext.Provider value={{ socket, connected }}>
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