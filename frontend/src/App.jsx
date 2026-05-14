import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register' 
import OurFood from './pages/OurFood'
import Contact from './pages/Contact'
import About from './pages/About' 
import AdminDashboard from './pages/AdminDashboard'
import Otp from './pages/Otp'
import CategoriesContent from './pages/admin/CategoriesContent'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import './App.css'

function App() {

  return (
    <Router>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/ourfood' element={<OurFood />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/about' element={<About />} />
        <Route path='/otp' element={<Otp />} />

        <Route path="/admin/*" element={<AdminDashboard />}>
            <Route path="categories" element={<CategoriesContent />} />
        
        </Route>

      </Routes>
    </Router>
  )
}

export default App
