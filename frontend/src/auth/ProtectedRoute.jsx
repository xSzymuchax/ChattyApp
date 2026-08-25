import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

function ProtectedRoute({children}) {
    const { isLoggedIn } = useAuth();

    if (!isLoggedIn)
        return <Navigate to='/loginPage' replace />

    return children;
}

export default ProtectedRoute