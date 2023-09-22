import { createContext, useContext } from "react"

const SocketContext = createContext();
import { socket } from "@/classes/socket";

export function SocketProvider({ children }) {


    return <SocketContext.Provider value={{ socket }}>
        {children}
    </SocketContext.Provider>
}

export function useSocketContext() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error("useSocketContext must be used within an I18NProvider")
    }

    return context;
}