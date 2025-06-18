// src/App.tsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ResourcesPage } from './pages/ResourcesPage';
import LandingPage from './pages/LandingPage';

function App() {
  return (
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
  );
}

export default App;