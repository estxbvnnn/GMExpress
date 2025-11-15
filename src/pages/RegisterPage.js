import React from "react";
import { Link, Navigate } from "react-router-dom";

// Este componente es redundante con src/pages/Register.jsx.
// Puedes eliminarlo o dejar este placeholder para no usar dos flujos distintos.
const RegisterPage = () => {
  // Redirige siempre al nuevo formulario de registro
  return <Navigate to="/register" replace />;
};

export default RegisterPage;
