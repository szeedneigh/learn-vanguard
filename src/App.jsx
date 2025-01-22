import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './app/landing/LandingPage';
import SignUp from './app/auth/SignUp';
import LogIn from './app/auth/LogIn';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

function App() {
  return (

    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/dashboard/*" element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

