// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResourcesPage } from './pages/ResourcesPage';
import LandingPage from './pages/LandingPage';
import { ThemeProvider } from './components/ThemeProvider';

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="dsa-qbank-theme">
      <Router>
        <div className="min-h-screen">
          <div className="container mx-auto">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
            </Routes>
          </div>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;