import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { BASE_URL_ADMIN} from "../../API";

const initialState = {
  sections: [],
  currentSection: null,
  loading: false,
  error: null,
};

const sectionSlice = createSlice({
  name: "sections",
  initialState,
  reducers: {
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setSections: (state, action) => {
      state.sections = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    removeSection: (state, action) => {
      state.sections = state.sections.filter(
        (section) => section._id !== action.payload
      );
    },
    setCurrentSection: (state, action) => {
      state.currentSection = action.payload;
    },
    clearCurrentSection: (state) => {
      state.currentSection = null;
    },
    updateSection: (state, action) => {
      const index = state.sections.findIndex(
        (section) => section._id === action.payload._id
      );
      if (index !== -1) {
        state.sections[index] = action.payload;
      }
      if (state.currentSection?._id === action.payload._id) {
        state.currentSection = action.payload;
      }
    },
    addSection: (state, action) => {
      state.sections.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setSections,
  setError,
  removeSection,
  setCurrentSection,
  clearCurrentSection,
  updateSection,
  addSection,
} = sectionSlice.actions;

export const fetchSections = (pageId) => async (dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(
      `${BASE_URL_ADMIN}`
    );
    dispatch(setSections(response.data.data));
    return response.data;
  } catch (error) {
    dispatch(
      setError(error.response?.data?.message || "Failed to fetch sections")
    );
    throw error;
  } finally {
    dispatch(setLoading(false));
  }
};

export const deleteSection = (pageId, sectionId) => async (dispatch) => {
  try {
    await axios.delete(
      `${BASE_URL_ADMIN}`
    );
    dispatch(removeSection(sectionId));
    return { status: true, message: "Section deleted successfully" };
  } catch (error) {
    dispatch(
      setError(error.response?.data?.message || "Failed to delete section")
    );
    throw error;
  }
};

export const saveSection = (sectionData) => async (dispatch) => {
  try {
    const { pageId, _id } = sectionData;
    const method = _id ? "put" : "post";
    const url = _id
      ? `${BASE_URL_ADMIN}`
      : `${BASE_URL_ADMIN}`;


    const response = await axios[method](url, sectionData);

    // If the API doesn't return updated section data, use the sectionData sent
    const updatedSection = { ...sectionData };

    // Dispatch the appropriate action based on whether it's an update or add
    dispatch(_id ? updateSection(updatedSection) : addSection(updatedSection));

    return response.data; // Return the response for further handling
  } catch (error) {
    console.error("Error during save section:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    const errorMsg = error.response?.data?.message || "Failed to save section";
    dispatch(setError(errorMsg));
    throw new Error(errorMsg);
  }
};

export default sectionSlice.reducer;
