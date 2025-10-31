// redux/slices/pageSlice.js

import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL_ADMIN } from "../../API";

// Initial state for the pages
const initialState = {
  pages: [],
  loading: false,
  error: null,
};

const pageSlice = createSlice({
  name: "pages",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setPages: (state, action) => {
      state.pages = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    removePage: (state, action) => {
      state.pages = state.pages.filter((page) => page._id !== action.payload);
    },
  },
});

// Thunk for fetching pages from the API
export const fetchPages = () => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${BASE_URL_ADMIN}`);
    dispatch(setPages(response.data.data));
  } catch (error) {
    dispatch(setError(error.message));
  } finally {
    dispatch(setLoading(false));
  }
};

// Thunk for deleting a page
export const deletePage = (pageId) => async (dispatch) => {
  try {
    await axios.delete(`/api/pages/${pageId}`);
    dispatch(removePage(pageId)); // Dispatch the action to remove the page from the state
  } catch (error) {
    dispatch(setError(error.message));
  }
};

export const { setLoading, setPages, setError, removePage } = pageSlice.actions;
export default pageSlice.reducer;
