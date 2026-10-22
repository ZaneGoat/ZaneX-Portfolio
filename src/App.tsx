import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { PersonaProvider } from "./context/PersonaContext";
import { MusicProvider } from "./context/MusicContext";
import { OperatorClearanceProvider } from "./context/OperatorClearanceContext";
import Index from "./pages/Index";

const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <PersonaProvider>
    <OperatorClearanceProvider>
      <MusicProvider>
        <BrowserRouter>
          <Suspense fallback={null}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/game" element={<Navigate to="/" replace />} />
              <Route path="/arcane-maze" element={<Navigate to="/" replace />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </MusicProvider>
    </OperatorClearanceProvider>
  </PersonaProvider>
);

export default App;
