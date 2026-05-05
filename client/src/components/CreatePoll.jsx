import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useStore } from '../store';

const CreatePoll = () => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [state, dispatch] = useStore();
    const navigate = useNavigate();

    const handleAddOption = () => setOptions([...options, '']);

    const handleAnswer = (e, index) => {
        const newOptions = [...options];
        newOptions[index] = e.target.value;
        setOptions(newOptions);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            await api.call('post', 'polls', { question, options });
            navigate('/');
        } catch (err) {
            dispatch({ type: 'SET_ERROR', payload: err.response?.data?.message });
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <label className="form-label" htmlFor="question">Question</label>
            <input
                className="form-input"
                type="text"
                name="question"
                value={question}
                onChange={e => setQuestion(e.target.value)}
            />
            {options.map((option, i) => (
                <div key={i}>
                    <label className="form-label">Option {i + 1}</label>
                    <input
                        className="form-input"
                        type="text"
                        value={option}
                        onChange={e => handleAnswer(e, i)}
                    />
                </div>
            ))}
            <div className="button-group">
                <button className="button" type="button" onClick={handleAddOption}>
                    Add Option
                </button>
                <button className="button" type="submit">Submit</button>
            </div>
        </form>
    );
};

export default CreatePoll;
