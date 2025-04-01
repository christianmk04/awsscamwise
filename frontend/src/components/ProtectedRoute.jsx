import { useState, useEffect } from 'react';
// import { Navigate } from 'react-router-dom';
import ProtectionPage from './ProtectionPage';


const ProtectedRoute = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('userId'));

  useEffect(() => {
    // You can also add additional checks here for authentication if needed
    setIsAuthenticated(!!localStorage.getItem('userId'));
  }, []);

  if (!isAuthenticated) {
    return <ProtectionPage />; // Redirect to the login reminder page if not authenticated
  }

  return children; // Render the protected content if authenticated
};

export default ProtectedRoute;
