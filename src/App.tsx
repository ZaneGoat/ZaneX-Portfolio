import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PersonaProvider } from "./context/PersonaContext";
import { MusicProvider } from "./context/MusicContext";
import Index from "./pages/Index";

// Unused providers (React Query, Radix Tooltip, two toast systems) were removed — nothing on the site used them.
const NotFound = lazy(() => import("./pages/NotFound"));

const App = () => (
  <PersonaProvider>
    <MusicProvider>
      <BrowserRouter>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Index />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </MusicProvider>
  </PersonaProvider>
);

export default App;
