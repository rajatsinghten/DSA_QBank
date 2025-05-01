// src/App.tsx
import { useState } from 'react';
import { ResourcesPage } from './pages/ResourcesPage';
import VideoCallPage from './pages/VideoCallPage';

function App() {
  const [currentPage, setCurrentPage] = useState<'resources' | 'video-call'>('resources');

  const renderPage = () => {
    switch (currentPage) {
      case 'video-call':
        return <VideoCallPage />;
      case 'resources':
      default:
        return <ResourcesPage />;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Simple navigation */}
      <nav className="bg-gray-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="text-xl font-bold">Your App</div>
          <div className="flex space-x-4">
            <button 
              onClick={() => setCurrentPage('resources')}
              className={`px-3 py-2 rounded-md ${currentPage === 'resources' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              Resources
            </button>
            <button 
              onClick={() => setCurrentPage('video-call')}
              className={`px-3 py-2 rounded-md ${currentPage === 'video-call' ? 'bg-gray-700' : 'hover:bg-gray-700'}`}
            >
              Video Call
            </button>
          </div>
        </div>
      </nav>

      {/* Page content */}
      <div className="container mx-auto">
        {renderPage()}
      </div>
    </div>
  );
}

export default App;