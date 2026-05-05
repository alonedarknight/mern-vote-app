import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';

const Polls = () => {
    const [polls, setPolls] = useState([]);
    const [state, dispatch] = useStore();

    useEffect(() => {
        const getPolls = async () => {
            try {
                const data = await api.call('get', 'polls');
                setPolls(data);
            } catch (err) {
                dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
            }
        };
        getPolls();
    }, [dispatch]);

    const getUserPolls = async () => {
        try {
            const data = await api.call('get', 'polls/user');
            setPolls(data);
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    return (
        <div className="polls-container">
            {state.isAuthenticated && (
                <div className="button-group">
                    <button className="button" onClick={() => window.location.reload()}>All Polls</button>
                    <button className="button" onClick={getUserPolls}>My Polls</button>
                </div>
            )}
            <ul className="polls-list">
                {polls.map(poll => (
                    <li key={poll._id}>
                        <Link to={`/poll/${poll._id}`}>
                            <div className="poll-card">
                                <div className="poll-info">
                                    <span>{poll.question}</span>
                                    {state.user && poll.voted && poll.voted.includes(state.user.id) && (
                                        <span className="voted-badge">Voted</span>
                                    )}
                                </div>
                                <span className="view-details">View Details &rarr;</span>
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Polls;
