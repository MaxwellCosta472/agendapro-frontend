import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

// Páginas de autenticação
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'

// Páginas do cliente
import { ClientDashboard } from './pages/client/Dashboard'
import { BookAppointment } from './pages/client/BookAppointment'
import { MyAppointments } from './pages/client/MyAppointments'

// Páginas do profissional
import { ProfessionalDashboard } from './pages/professional/Dashboard'
import { Calendar } from './pages/professional/Calendar'
import { Services } from './pages/professional/Services'
import { Clients } from './pages/professional/Clients'
import { Schedules } from './pages/professional/Schedules'

// Guards de rota
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuthStore()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function RequireProfessional({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'professional') return <Navigate to="/cliente" replace />
  return children
}

function RequireClient({ children }: { children: JSX.Element }) {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (user?.role !== 'client') return <Navigate to="/profissional" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Register />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Rotas do cliente */}
        <Route
          path="/cliente"
          element={<RequireClient><ClientDashboard /></RequireClient>}
        />
        <Route
          path="/cliente/agendar"
          element={<RequireClient><BookAppointment /></RequireClient>}
        />
        <Route
          path="/cliente/agendamentos"
          element={<RequireClient><MyAppointments /></RequireClient>}
        />

        {/* Rotas do profissional */}
        <Route
          path="/profissional"
          element={<RequireProfessional><ProfessionalDashboard /></RequireProfessional>}
        />
        <Route
          path="/profissional/agenda"
          element={<RequireProfessional><Calendar /></RequireProfessional>}
        />
        <Route
          path="/profissional/servicos"
          element={<RequireProfessional><Services /></RequireProfessional>}
        />
        <Route
          path="/profissional/clientes"
          element={<RequireProfessional><Clients /></RequireProfessional>}
        />
        <Route
          path="/profissional/horarios"
          element={<RequireProfessional><Schedules /></RequireProfessional>}
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
