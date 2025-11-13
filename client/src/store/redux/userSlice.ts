import { createSlice } from '@reduxjs/toolkit';
const initialState = {
  amount: 0
}
const userSlice = createSlice({
  name: 'user',
  initialState: initialState,
  reducers: {
    setUser: (state, action) => {
      Object.assign(state, action.payload);
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;