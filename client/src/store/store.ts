import { configureStore } from '@reduxjs/toolkit';
import amountReducer from './redux/amountSlice';

export const store = configureStore({
  reducer: {
    amount: amountReducer,
  },
});