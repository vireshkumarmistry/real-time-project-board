import { configureStore, combineReducers } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import projectReducer from "./projectSlice";
import taskReducer from "./taskSlice";
import type { TypedUseSelectorHook } from "react-redux";
import { useSelector as useReduxSelector } from "react-redux";
import { persistStore, persistReducer } from "redux-persist";
import { authPersistConfig } from "./persistConfig";

const rootReducer = combineReducers({
  auth: persistReducer(authPersistConfig, authReducer),
  projects: projectReducer,
  tasks: taskReducer,
});

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;

export default store;
