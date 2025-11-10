import { createSlice } from '@reduxjs/toolkit';

const amountSlice = createSlice({
  name: 'amount',
  initialState: { value: 0 },
  reducers: {
    setAmount: (state, action) => {
      state.value = action.payload;
    },
  },
});

export const { setAmount } = amountSlice.actions;
export default amountSlice.reducer;