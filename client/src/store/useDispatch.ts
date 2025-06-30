import { useDispatch as useReduxDispatch } from "react-redux";
import type { AppDispatch } from "./index";

// Typed useDispatch hook for thunks
export const useDispatch: () => AppDispatch = useReduxDispatch;
