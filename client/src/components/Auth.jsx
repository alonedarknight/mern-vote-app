import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';
import { jwtDecode } from 'jwt-decode';

const Auth = ({ authType }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [state, dispatch] = useStore();
    const navigate = useNavigate();

    const handleChange = e => {
        if (e.target.name === 'username') setUsername(e.target.value);
        if (e.target.name === 'password') setPassword(e.target.value);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const data = await api.call('post', `auth/${authType}`, { username, password });
            const { token } = data;
            localStorage.setItem('jwtToken', token);
            api.setToken(token);
            const user = jwtDecode(token);
            dispatch({ type: 'SET_USER', payload: user });
            dispatch({ type: 'REMOVE_ERROR' });
            navigate('/');
        } catch (err) {
            dispatch({
                type: 'SET_ERROR',
                payload: err.response?.data?.message || 'Something went wrong',
            });
        }
    };

    return (
        <div className="auth-form">
            <h2>{authType === 'login' ? 'Login' : 'Register'}</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div>
                    <label className="form-label" htmlFor="username">Username</label>
                    <input
                        className="form-input"
                        type="text"
                        value={username}
                        name="username"
                        onChange={handleChange}
                    />
                </div>
                <div>
                    <label className="form-label" htmlFor="password">Password</label>
                    <input
                        className="form-input"
                        type="password"
                        value={password}
                        name="password"
                        onChange={handleChange}
                    />
                </div>
                <button className="button" type="submit">Submit</button>
            </form>
        </div>
    );
};

export default Auth;
