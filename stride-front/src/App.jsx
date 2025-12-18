import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import axios from 'axios';

import StrideLayout from './components/StrideLayout';
import Home from './pages/home';
import Cart from './pages/cart';
import Checkout from './pages/checkout';
import Shop from './pages/shop';
import ProductDetails from './pages/productDetails';
import StrideLogin from './pages/strideLogin';
import OrderPage from './pages/orders';
import AuthListener from './components/AuthToken';
import { isLoggedInAtom } from './state/authAtoms';
import Admin from './pages/admin/admin'
import AccountPage from './pages/account';
import ProtectedRoute from './components/RutaLogeada'; // Importa el componente de rutas protegidas



import { useAtom } from 'jotai';

const AppContent = () => {
    const [isLoggedIn] = useAtom(isLoggedInAtom);
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<StrideLogin />} />
                <Route
                    path="/admin"
                    element={
                        <ProtectedRoute>
                            <Admin />
                        </ProtectedRoute>
                    }
                />
                <Route path="/" element={<StrideLayout />}>
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="/home" element={<Home key={isLoggedIn} />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/productDetails" element={<ProductDetails />} />

                    <Route
                        path="/myAccount"
                        element={
                            <ProtectedRoute>
                                <AccountPage />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/cart"
                        element={
                            <ProtectedRoute>
                                <Cart />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/checkout"
                        element={
                            <ProtectedRoute>
                                <Checkout />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/MyOrders"
                        element={
                            <ProtectedRoute>
                                <OrderPage />
                            </ProtectedRoute>
                        }
                    />
                </Route>
            </Routes>
        </Router>
    );
};

const App = () => (
    <AuthListener>
        <AppContent />
    </AuthListener>
);

export default App;