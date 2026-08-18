import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import Explore from './pages/Explore'
import AppLayout from './layouts/AppLayout'
import AdminLayout from './layouts/AdminLayout'
import Dashboard from './pages/app/Dashboard'
import Roadmap from './pages/app/Roadmap'
import Catalog from './pages/app/Catalog'
import Progress from './pages/app/Progress'
import Skills from './pages/app/Skills'
import Community from './pages/app/Community'
import Market from './pages/app/Market'
import Mentoria from './pages/app/Mentoria'
import Lives from './pages/app/Lives'
import Profile from './pages/app/Profile'
import Planos from './pages/app/Planos'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTrilhas from './pages/admin/AdminTrilhas'
import AdminConteudos from './pages/admin/AdminConteudos'
import AdminParceiros from './pages/admin/AdminParceiros'
import AdminRelatorios from './pages/admin/AdminRelatorios'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/explore" element={<Explore />} />

        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="roadmap" element={<Roadmap />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="progress" element={<Progress />} />
          <Route path="skills" element={<Skills />} />
          <Route path="community" element={<Community />} />
          <Route path="market" element={<Market />} />
          <Route path="mentoria" element={<Mentoria />} />
          <Route path="lives" element={<Lives />} />
          <Route path="profile" element={<Profile />} />
          <Route path="planos" element={<Planos />} />
        </Route>

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="trilhas" element={<AdminTrilhas />} />
          <Route path="conteudos" element={<AdminConteudos />} />
          <Route path="parceiros" element={<AdminParceiros />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
