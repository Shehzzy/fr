import { configureStore } from "@reduxjs/toolkit";
import adminDetailReducer from "./slices/AdminDetails";
import pageReducer from "./slices/pageSlice";
import sectionReducer from "./slices/sectionSlice";

const store = configureStore({
  reducer: {
    user: adminDetailReducer,
    pages: pageReducer,
    sections: sectionReducer,
  },
});

export default store;
