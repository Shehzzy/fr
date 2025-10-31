import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const useAuth = () => {
  const user_token = localStorage.getItem('token');
  return user_token;
};

const ProtectedRoutes = ({ element }) => {
  const isAuthenticated = useAuth();
  return isAuthenticated ? <Outlet/> : <Navigate to={'/'}/>
};

export default ProtectedRoutes;
