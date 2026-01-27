import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
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
// import { enableDevToolsProtection } from './utils/devToolsProtection';

function App() {
  // Enable DevTools protection - redirects to Google if DevTools is detected
  // useEffect(() => {
  //   const cleanupDevTools = enableDevToolsProtection();
  //   return cleanupDevTools;
  // }, []);

  // Simple debugger IIFE equivalent in TSX
  useEffect(() => {
    (function anonymous() {
      // This will pause execution if DevTools is open
      // and makes it harder for người dùng vô hiệu hóa bằng cách xóa inline script
      // (vì nó được bundle trong React app)
      debugger;
    })();
  }, []);

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
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgba(15, 15, 20, 0.95)',
            color: '#ffffff',
            border: '1px solid rgba(138, 43, 226, 0.3)',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: '0 4px 5px rgba(0, 0, 0, 0.3)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(34, 197, 94, 0.3)',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              border: '1px solid rgba(239, 68, 68, 0.3)',
            },
          },
        }}
      />
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
