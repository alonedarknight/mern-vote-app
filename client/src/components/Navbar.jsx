import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../store';

const Navbar = () => {
    const [state, dispatch] = useStore();

    const logout = () => {
        localStorage.removeItem('jwtToken');
        dispatch({ type: 'SET_USER', payload: {} });
    };

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link className="navbar-brand" to="/">
                    VOTE.IO
                </Link>
                <ul className="navbar-nav">
                    {state.isAuthenticated ? (
                        <>
                            <li>
                                <Link to="/poll/new">Create Poll</Link>
                            </li>
                            <li className="nav-user">@{state.user.username}</li>
                            <li>
                                <a className="logout-link" onClick={logout}>Logout</a>
                            </li>
                        </>
                    ) : (
                        <>
                            <li>
                                <Link to="/register">Register</Link>
                            </li>
                            <li>
                                <Link to="/login">Login</Link>
                            </li>
                        </>
                    )}
                </ul>
            </div>
        </nav>
    );
};

export default Navbar;
