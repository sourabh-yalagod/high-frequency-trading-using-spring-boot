import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Chart from './components/Chart'
import Signin from './pages/auth/Signin'
import ForgotPassword from './pages/auth/FormgotPassword'
import PrivateRoute from './pages/auth/PrivateRoute'
import Dashboard from './pages/dashboard/Dashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/chart/:asset' element={<Chart />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Add more protected routes here */}
        </Route>
      </Routes>
    </BrowserRouter >
  )
}

export default App
