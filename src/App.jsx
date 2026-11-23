import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import Home from './pages/Home';
import Gallery from './pages/Gallery';
import PosterDetail from './pages/PosterDetail';
import EmailStart from './pages/auth/EmailStart';
import Verify from './pages/auth/Verify';
import Welcome from './pages/auth/Welcome';
import Wall from './pages/wall/Wall';
import Copy from './pages/wall/Copy';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import About from './pages/About';
import Settings from './pages/Settings';
import Collector from './pages/Collector';
import Messages from './pages/messages/Messages';
import { useAuthStore } from './store/authStore';
import { accountsEnabled } from './config/features';

function App() {
  const { user } = useAuthStore();

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/poster/:id" element={<PosterDetail />} />
          {accountsEnabled && (
            <>
              <Route path="/join" element={user ? <Navigate to="/wall" replace /> : <EmailStart mode="join" />} />
              <Route path="/signin" element={user ? <Navigate to="/wall" replace /> : <EmailStart mode="signin" />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/welcome" element={<RequireAuth><Welcome /></RequireAuth>} />
              <Route path="/wall" element={<RequireAuth><Wall /></RequireAuth>} />
              <Route path="/wall/:id" element={<RequireAuth><Copy /></RequireAuth>} />
              <Route path="/messages" element={<RequireAuth><Messages /></RequireAuth>} />
              <Route path="/messages/:id" element={<RequireAuth><Messages /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/c/:handle" element={<Collector />} />
              <Route path="/login" element={<Navigate to="/signin" replace />} />
              <Route path="/signup" element={<Navigate to="/join" replace />} />
              <Route path="/collection" element={<Navigate to="/wall" replace />} />
            </>
          )}
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
