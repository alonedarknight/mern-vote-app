import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

import { StateProvider, useStore } from '../store';
import api from '../services/api';

import Navbar from './Navbar';
import Auth from './Auth';
import Polls from './Polls';
import CreatePoll from './CreatePoll';
import Poll from './Poll';
import EditPoll from './EditPoll';

const AppContent = () => {
    const [state, dispatch] = useStore();

    useEffect(() => {
        if (localStorage.getItem('jwtToken')) {
            const token = localStorage.getItem('jwtToken');
            api.setToken(token);
            try {
                const user = jwtDecode(token);
                dispatch({ type: 'SET_USER', payload: user });
            } catch (err) {
                dispatch({ type: 'SET_USER', payload: {} });
                api.setToken(null);
            }
        }
    }, [dispatch]);

    useEffect(() => {
        if (state.error) {
            const timer = setTimeout(() => {
                dispatch({ type: 'REMOVE_ERROR' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [state.error, dispatch]);

    return (
        <Router>
            <Navbar />
            <div className="container">
                {state.error && <div className="error-msg">{state.error}</div>}
                <Routes>
                    <Route path="/" element={<Polls />} />
                    <Route path="/login" element={<Auth authType="login" />} />
                    <Route path="/register" element={<Auth authType="register" />} />
                    <Route path="/poll/new" element={<CreatePoll />} />
                    <Route path="/poll/:id" element={<Poll />} />
                    <Route path="/poll/:id/edit" element={<EditPoll />} />
                </Routes>
            </div>
        </Router>
    );
};

const App = () => (
    <StateProvider>
        <AppContent />
    </StateProvider>
);

export default App;