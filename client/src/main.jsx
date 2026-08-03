import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { EditorProvider } from "./context/EditorContext";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <EditorProvider>

      <App />

      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 2000,
          style: {
            background: "#1e293b",
            color: "#ffffff",
            border: "1px solid #334155",
          },
        }}
      />

    </EditorProvider>
  </StrictMode>
);