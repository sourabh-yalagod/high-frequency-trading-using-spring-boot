import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Signup from './pages/auth/Signup'
import Chart from './components/Chart'
import Signin from './pages/auth/Signin'
import ForgotPassword from './pages/auth/FormgotPassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/signup' element={<Signup />} />
        <Route path='/signin' element={<Signin />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/chart/:asset' element={<Chart />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App
