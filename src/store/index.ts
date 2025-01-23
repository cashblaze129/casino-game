// src/store/store.ts  
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth';
import settingReducer from './setting';
import { TypedUseSelectorHook, useDispatch as useAppDispatch, useSelector as useAppSelector } from 'react-redux';
import { combineReducers } from 'redux';

const reducer = combineReducers({
    auth: authReducer,
    setting: settingReducer
});

const store = configureStore({
    reducer,
});

// For TypeScript support  
export type RootState = ReturnType<typeof reducer>;

export type AppDispatch = typeof store.dispatch;
const { dispatch } = store;

const useDispatch = () => useAppDispatch<AppDispatch>();
const useSelector: TypedUseSelectorHook<RootState> = useAppSelector;
export { store, dispatch, useDispatch, useSelector };  