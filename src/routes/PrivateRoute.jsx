import React from "react";
import { Navigate } from "react-router-dom";
import { useUser } from "../context/UserContext";

export function PrivateRoute({ children, roles }) {
  const { user } = useUser();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.rol)) return <Navigate to="/" />;
  return children;
}
