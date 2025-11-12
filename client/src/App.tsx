import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Chart from './pages/chart/Chart'
import Signin from './pages/auth/Signin'
import ForgotPassword from './pages/auth/FormgotPassword'
import PrivateRoute from './pages/auth/PrivateRoute'
import Dashboard from './pages/dashboard/Dashboard'
import UserProfile from './pages/UserProfile'
import About from './pages/About'
import Settings from './pages/Settings'
import Deposite from './pages/Deposite'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/about' element={<About />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path="/" element={<Dashboard />} />
        <Route element={<PrivateRoute />}>
          <Route path='/chart/:symbol' element={<Chart />} />
          <Route path='/deposit/:userId' element={<Deposite />} />
          <Route path='/profile/:userId' element={<UserProfile />} />
          <Route path='/settings/:userId' element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter >
  )
}

export default App
