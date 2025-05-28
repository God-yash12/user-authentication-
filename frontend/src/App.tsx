import { Toaster } from 'react-hot-toast'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import { RegisterForm } from './components/RegisterForm'
import VerifyOTP from './components/VerifyOTP'



function App() {

  return (
    <>
      <Router>
        <Toaster />
        <Routes>
          <Route path="/" element={<RegisterForm />} />
          <Route path="/VerifyOTP" element={<VerifyOTP />} />
          {/* Add other routes as needed */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  )
}

export default App
