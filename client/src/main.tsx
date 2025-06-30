import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store, { persistor } from "./store";
import App from "./App";
import { PersistGate } from "redux-persist/integration/react";
import { SnackbarProvider } from "notistack";
import Notifier from "./components/Notifier";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <App />
          <Notifier />
        </SnackbarProvider>
      </PersistGate>
    </Provider>
  </StrictMode>
);
