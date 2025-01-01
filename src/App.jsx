import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './app/landing/LandingPage';
import SignUp from './app/auth/SignUp';
import SignUpStep2 from './app/auth/SignUpStep2';
import LogIn from './app/auth/LogIn';



function App () {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path='signup' element={<SignUp/>}/>
        <Route path='signupstep2' element={<SignUpStep2/>}/>
        <Route path='login' element={<LogIn/>}/>
      </Routes>
    </Router>
  )
}

export default App;