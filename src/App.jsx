import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './app/pages/LandingPage';
import SignUp from './app/auth/SignUp';
import LogIn from './app/auth/LogIn';
import Dashboard from './app/pages/Dashboard';
import NotFound from './app/pages/NotFound';
import ForgotPassword from './app/auth/ForgotPassword';
import ProtectedRoute from './app/auth/ProtectedRoute';
import UnauthorizedPage from './app/pages/UnauthorizedPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard/*" element={<Dashboard />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;

