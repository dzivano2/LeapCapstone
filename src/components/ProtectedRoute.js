import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const ProtectedRoute = ({ element: Component, userId, ...rest }) => {
  const { user, token } = useAuth();
  const [isAuthChecked, setIsAuthChecked] = useState(false);

  useEffect(() => {
    if (user !== null) {
      setIsAuthChecked(true);
    }
  }, [user, token]);

  if (!isAuthChecked) {
    return null; // Or a loading spinner if you prefer
  }

  if (!user || !token) {
    console.log('Protected route: User not authenticated');
    return <Navigate to="/login" />;
  }

  // ✅ Check if the logged-in user's ID matches the route userId
  if (userId && user._id !== userId) {
    console.log('Protected route: User does not have permission');
    return <Navigate to="/user-dashboard" />;
  }

  console.log('Protected route: User authenticated');
  return <Component {...rest} />;
};

export default ProtectedRoute;
