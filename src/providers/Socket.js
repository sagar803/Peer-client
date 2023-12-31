import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";

const socketContext = createContext(null);

export const SocketProvider = ({children}) => {
    const backendURL = process.env.REACT_APP_SERVER;
    const socket = useMemo(() => io(backendURL), [backendURL]);

    return (
        <socketContext.Provider value={{socket}}>
            {children}
        </socketContext.Provider>
    )
}

export default function useSocket(){
    return useContext(socketContext);
}

/*
The useMemo hook in React is used to memoize the result of a computation. Memoization is an optimization technique where the result of an expensive function is cached so that the computation is not repeated if the inputs to the function remain the same. This can be particularly useful in scenarios where you have computationally expensive calculations or where you want to optimize the performance of your React components.
*/