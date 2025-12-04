import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const isAuthenticated = localStorage.getItem('isAdminLoggedIn') === 'true';

    if (!isAuthenticated) {
        return <Navigate to="/management/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
