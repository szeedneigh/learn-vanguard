import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './app/landing/LandingPage';


function App () {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
      </Routes>
    </Router>
  )
}

export default App;