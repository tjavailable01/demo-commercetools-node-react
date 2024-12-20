import React from 'react';
import { BrowserRouter as Router, Route, Routes, Redirect } from 'react-router-dom';
import ProductList from '../components/ProductList';
import ProductDetails from '../components/ProductDetails';
import LoginForm from "../components/LoginForm";
import RegisterForm from "../components/RegisterForm";

function AppRouter() {
    return (
        <div className="App">
            <h1>CommerceTools Products</h1>
            <Router>
                <Routes>
                    <Route path="/products" element={<ProductList />} />
                    <Route path="/products/:id" element={<ProductDetails />} />
                    <Route path="/login" element={<LoginForm />} />
                    <Route path="/register" element={<RegisterForm />} />
                </Routes>
            </Router>
        </div>
    );
}

export default AppRouter;
