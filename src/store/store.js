import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./auth/authSlice";
import schemeReducer from "./scheme/schemeSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    scheme: schemeReducer,
  },
});
