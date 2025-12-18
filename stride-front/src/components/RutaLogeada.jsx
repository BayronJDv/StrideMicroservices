import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAtom } from 'jotai';
import { isLoggedInAtom, loadingAtom } from '../state/authAtoms';

const ProtectedRoute = ({ children }) => {
    const [isLoggedIn] = useAtom(isLoggedInAtom);
    const [loading] = useAtom(loadingAtom);

    if (loading) {
        return <div>Loading...</div>;
    }

    return isLoggedIn ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
