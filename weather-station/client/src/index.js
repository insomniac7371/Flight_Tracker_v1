import React from "react";
import ReactDOM from "react-dom";
import App from "~/components/App";
import ErrorBoundary from "~/components/ErrorBoundary";
import { AppContextProvider } from "~/AppContext";
import "~/styles";

ReactDOM.render(
  <ErrorBoundary>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </ErrorBoundary>,
  document.getElementById("root")
);
