import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Chart from './pages/chart/Chart'
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
        <Route path='/chart/:symbol' element={<Chart />} />
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter >
  )
}

export default App
