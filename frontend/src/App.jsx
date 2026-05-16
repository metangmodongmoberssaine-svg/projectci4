import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register' 
import OurFood from './pages/OurFood'
import Contact from './pages/Contact'
import About from './pages/About' 
import AdminDashboard from './pages/AdminDashboard'
import Otp from './pages/Otp'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Repas from './pages/admin/Repas/Repas'
import './App.css'
import CategoriesContent from './pages/admin/categories/Categories'
import Promotion from './pages/admin/Promotions/Promotion'
import Profilte from './pages/admin/Profilte'
import Notification from './pages/admin/Notification'
import Livreur from './pages/admin/Livreur'
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
            <Route path="repas" element={<Repas />} />
            <Route path="promotions" element={<Promotion />} />
            <Route path="profile" element={<Profilte />} />
            <Route path="notifications" element={<Notification />} />
            <Route path="livreurs" element={<Livreur />} />
        </Route>

      </Routes>
    </Router>
  )
}

export default App
