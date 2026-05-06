import { createContext, useContext, useState } from "react";

export const authContext = createContext();

export const useAuth = () => {
  return useContext(authContext);
};

export const AuthContextProvider = ({ children }) => {
  const [authData, setAuthData] = useState(
    JSON.parse(localStorage.getItem("chatapp")) || null,
  );


  return (
    <authContext.Provider value={{ authData, setAuthData }}>
      {children}
    </authContext.Provider>
  );
};
