import { useAuth } from "@/context/AuthContext";
import React from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";

const VerifyUser = () => {
  const { authData } = useAuth();
  return authData ? <Outlet /> : <Navigate to={"/login"} />;
};

export default VerifyUser;
