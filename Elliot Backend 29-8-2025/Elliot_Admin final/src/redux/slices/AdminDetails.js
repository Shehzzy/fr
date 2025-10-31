import { createSlice } from "@reduxjs/toolkit";

const initialState = { user: null }
const AdminDetails = createSlice({
    name: 'adminDetail',
    initialState,
    reducers: {
        setUser: (state, action) => { state.user = action.payload }
    }
});

export const { setUser } = AdminDetails.actions;
export default AdminDetails.reducer