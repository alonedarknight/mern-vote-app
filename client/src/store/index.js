import React, { createContext, useReducer, useContext } from 'react';

const initialState = {
    isAuthenticated: false,
    user: null,
    error: null,
};

const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
    const [state, dispatch] = useReducer((state, action) => {
        switch (action.type) {
            case 'SET_USER':
                return {
                    ...state,
                    isAuthenticated: Object.keys(action.payload).length !== 0,
                    user: action.payload,
                };
            case 'SET_ERROR':
                return {
                    ...state,
                    error: action.payload,
                };
            case 'REMOVE_ERROR':
                return {
                    ...state,
                    error: null,
                };
            default:
                return state;
        }
    }, initialState);

    return <Provider value={[state, dispatch]}>{children}</Provider>;
};

export const useStore = () => useContext(store);

export { store, StateProvider };
