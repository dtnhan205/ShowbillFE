import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import './styles/variables.css';
import './index.css';
import Home from './pages/Home';
import Profile from './pages/Profile';
import About from './pages/About';
import Contact from './pages/Contact';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Guide from './pages/Guide';
import { enableScreenshotProtection } from './utils/screenshotProtection';

function App() {
  // Enable screenshot protection globally
  useEffect(() => {
    const cleanup = enableScreenshotProtection({
      blockShortcuts: true,
      detectScreenshot: true,
      blockContextMenu: true,
      blockDragDrop: true,
      blockTextSelection: false, // Keep false to allow normal text interaction
      onScreenshotDetected: () => {
        // Optional: Log or show warning when screenshot is detected
        console.warn('[App] Screenshot attempt detected');
      },
    });

    return cleanup;
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0b0b12', color: '#e5e7eb' }}>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/guide" element={<Guide />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/admin/*"
            element={
              <ProtectedRoute>
                <Admin />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<div style={{ padding: 24 }}>404 - Not Found</div>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
