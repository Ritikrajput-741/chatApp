import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
  const url = `https://chatapp-2eab.onrender.com`;

  const [socket, setSocket] = useState(null);
  const [userOnline, setUserOnline] = useState([]);
  const { authData } = useAuth();

  useEffect(() => {
    if (authData) {
      const newSocket = io(`${url}`, {
        query: {
          userId: authData?.id,
        },
        withCredentials: true,
      });

      newSocket.on("getOnlineUser", (users) => {
        setUserOnline(users);
      });

      setSocket(newSocket);

      return () => newSocket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [authData]);

  return (
    <SocketContext.Provider value={{ socket, userOnline }}>
      {children}
    </SocketContext.Provider>
  );
};
