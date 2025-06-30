// redux-persist config for Vite + Redux Toolkit
import storage from "redux-persist/lib/storage";
import { persistReducer } from "redux-persist";

const authPersistConfig = {
  key: "auth",
  storage,
  whitelist: ["token", "user"],
};

export { authPersistConfig, persistReducer };
