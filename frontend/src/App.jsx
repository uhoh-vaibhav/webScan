import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import History from './pages/History.jsx'
import Navbar from './components/Navbar.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/report/:id" element={<Dashboard />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </>
  )
}
