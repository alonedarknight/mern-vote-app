import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';

const Poll = () => {
    const { id } = useParams();
    const [poll, setPoll] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
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

    const userVote = state.user && poll
        ? poll.voted.find(v => v.user === state.user.id)
        : null;
    const hasVoted = !!userVote;

    const handleSelect = (optionName) => {
        if (hasVoted && optionName === userVote.answer) return;
        setSelectedOption(optionName);
    };

    const handleConfirmVote = async () => {
        if (!selectedOption) return;
        try {
            const data = await api.call('post', `polls/${id}`, { answer: selectedOption });
            setPoll(data);
            setSelectedOption(null);
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    const handleUnvote = async () => {
        try {
            const data = await api.call('delete', `polls/${id}/vote`);
            setPoll(data);
            setSelectedOption(null);
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    const handleCancelSelect = () => {
        setSelectedOption(null);
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
            <div className="vote-options">
                {poll.options.map(option => {
                    const isUserVote = hasVoted && userVote.answer === option.option;
                    const isSelected = selectedOption === option.option;

                    return (
                        <div key={option._id} className="vote-option-wrapper">
                            <button
                                className={`vote-option-btn${isSelected ? ' selected' : ''}${isUserVote ? ' voted' : ''}`}
                                onClick={() => handleSelect(option.option)}
                            >
                                <span className="vote-option-radio">
                                    {isUserVote ? '✓' : isSelected ? '●' : '○'}
                                </span>
                                {option.option}
                                {isUserVote && <span className="your-vote-badge">Your vote</span>}
                            </button>
                            {isUserVote && !selectedOption && (
                                <div className="confirm-vote-bar">
                                    <span className="confirm-vote-text">
                                        You voted for: <strong>{userVote.answer}</strong>
                                    </span>
                                    <div className="button-group" style={{ marginBottom: 0 }}>
                                        <button className="button delete-btn" onClick={handleUnvote}>
                                            ✕ Unvote
                                        </button>
                                    </div>
                                </div>
                            )}
                            {isSelected && (
                                <div className="confirm-vote-bar">
                                    <span className="confirm-vote-text">
                                        {hasVoted ? 'Change vote to: ' : 'You selected: '}
                                        <strong>{selectedOption}</strong>
                                    </span>
                                    <div className="button-group" style={{ marginBottom: 0 }}>
                                        <button className="button" onClick={handleConfirmVote}>
                                            ✓ {hasVoted ? 'Change Vote' : 'Confirm Vote'}
                                        </button>
                                        <button className="button delete-btn" onClick={handleCancelSelect}>
                                            ✕ Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
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

