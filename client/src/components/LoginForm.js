import React, { useState } from 'react';
import { loginUser } from '../api';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const isLoggedIn = Boolean(localStorage.getItem('token'));

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await loginUser(email, password);
            console.log('Login successful:', response);
            localStorage.setItem('customerId', response.customerId);
            localStorage.setItem('token', response.token);
            // You can store the user data or token in local storage or state
            navigate('/products');
        } catch (err) {
            console.log("Error",err);
            setError('Invalid email or password');
        }
    };
    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('customerId');
        navigate('/login');
    };

    return (
        <div>
            {isLoggedIn ? (
                    <div>
                        <h2>Your already login.</h2>
                        <p>Click on Logout button to login again</p>
                        <button onClick={() => handleLogout()}>Logout</button>
                    </div>
            ) : (
                <div>
                    <h2>Login</h2>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button type="submit">Login</button>
                    </form>
                    {error && <p style={{color: 'red'}}>{error}</p>}
                </div>
            )}
        </div>
    )
};

export default LoginForm;
