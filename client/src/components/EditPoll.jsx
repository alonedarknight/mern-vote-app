import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';

const EditPoll = () => {
    const { id } = useParams();
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [loading, setLoading] = useState(true);
    const [state, dispatch] = useStore();
    const navigate = useNavigate();

    useEffect(() => {
        const getPoll = async () => {
            try {
                const data = await api.call('get', `polls/${id}`);
                setQuestion(data.question);
                setOptions(data.options.map(opt => opt.option));
                setLoading(false);
            } catch (err) {
                dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
                navigate('/');
            }
        };
        getPoll();
    }, [id, dispatch, navigate]);

    const handleAddOption = () => setOptions([...options, '']);

    const handleRemoveOption = (index) => {
        if (options.length <= 2) return;
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleAnswer = (e, index) => {
        const newOptions = [...options];
        newOptions[index] = e.target.value;
        setOptions(newOptions);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.call('put', `polls/${id}`, { question, options });
            navigate(`/poll/${id}`);
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <div className="button-group">
                <button className="button" onClick={() => navigate(`/poll/${id}`)}>Back</button>
            </div>
            <h2 style={{ marginBottom: '20px' }}>Edit Poll</h2>
            <form className="form" onSubmit={handleSubmit}>
                <div>
                    <label className="form-label" htmlFor="question">Question</label>
                    <input
                        className="form-input"
                        type="text"
                        name="question"
                        value={question}
                        onChange={e => setQuestion(e.target.value)}
                    />
                </div>
                {options.map((option, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                        <div style={{ flex: 1 }}>
                            <label className="form-label">Option {i + 1}</label>
                            <input
                                className="form-input"
                                type="text"
                                value={option}
                                onChange={e => handleAnswer(e, i)}
                            />
                        </div>
                        {options.length > 2 && (
                            <button
                                className="button delete-btn"
                                type="button"
                                onClick={() => handleRemoveOption(i)}
                                style={{ padding: '12px 16px' }}
                            >
                                ✕
                            </button>
                        )}
                    </div>
                ))}
                <div className="button-group">
                    <button className="button" type="button" onClick={handleAddOption}>
                        Add Option
                    </button>
                    <button className="button" type="submit">Update Poll</button>
                </div>
            </form>
        </div>
    );
};

export default EditPoll;
