import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';

const Poll = () => {
    const { id } = useParams();
    const [poll, setPoll] = useState(null);
    const [state, dispatch] = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const getPoll = async () => {
            try {
                const data = await api.call('get', `polls/${id}`);
                setPoll(data);
            } catch (err) {
                dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
            }
        };
        getPoll();
    }, [id, dispatch]);

    const handleVote = async answer => {
        try {
            const data = await api.call('post', `polls/${id}`, { answer });
            setPoll(data);
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    const handleDelete = async () => {
        try {
            await api.call('delete', `polls/${id}`);
            navigate('/');
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    if (!poll) return <div>Loading...</div>;

    const answers = poll.options.map(option => (
        <button
            className="button"
            key={option._id}
            onClick={() => handleVote(option.option)}
        >
            {option.option}
        </button>
    ));

    const totalVotes = poll.options.reduce((total, option) => total + option.votes, 0);

    return (
        <div className="poll-detail">
            <div className="button-group">
                <button className="button" onClick={() => navigate('/')}>Back</button>
                {state.user && poll.user && (state.user.id === poll.user || state.user.id === poll.user._id) && (
                    <>
                        <button className="button" onClick={() => navigate(`/poll/${id}/edit`)}>Edit Poll</button>
                        <button className="button delete-btn" onClick={handleDelete}>Delete Poll</button>
                    </>
                )}
            </div>
            <h3>{poll.question}</h3>
            <div className="button-group">{answers}</div>
            <div className="result-container">
                {poll.options.map(option => {
                    const percentage = totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;
                    return (
                        <div key={option._id} className="result-item">
                            <div className="result-label">
                                <span>{option.option}</span>
                                <span>{option.votes} votes ({percentage}%)</span>
                            </div>
                            <div className="progress-bar-bg">
                                <div 
                                    className="progress-bar-fill" 
                                    style={{ width: `${percentage}%` }}
                                ></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Poll;
