import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './views/LoginPage';
import MainPage from './views/MainPage';
import ProtectedRoute from './auth/ProtectedRoute';

const routerBasename =
    import.meta.env.BASE_URL === "/"
        ? undefined
        : import.meta.env.BASE_URL.replace(/\/$/, "");

function AppRouter() {
    return (
        <BrowserRouter basename={routerBasename}>
            <Routes>
                <Route path='/' element={<Navigate to='/loginPage' replace/>} />
                <Route path='/loginPage' element={<LoginPage/ >} />
                <Route path='/mainPage' element={
                    <ProtectedRoute>
                        <MainPage/ >
                    </ProtectedRoute>
                    } 
                />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter