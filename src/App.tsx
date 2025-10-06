import { Link, Navigate, Route, Routes } from 'react-router-dom'

import ClientApp from './pages/ClientApp'
import DeliveryApp from './pages/DeliveryApp'
import RestaurantApp from './pages/RestaurantApp'
import AdminPanel from './pages/AdminPanel'
import Login from './pages/Login'
import RoleGuard from './auth/RoleGuard'
import Home from './pages/Home'

function TopBar() {
  return (
    <header className="p-4 border-b flex items-center justify-between">
      <Link to="/" className="text-2xl font-bold">PedeLogo</Link>
      {/* Link de acesso removido para não expor informações de admin na página inicial */}
      <div />
    </header>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <TopBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />

          <Route element={<RoleGuard allowed={["client"]} />}>
            <Route path="/client/*" element={<ClientApp />} />
          </Route>
          <Route element={<RoleGuard allowed={["delivery"]} />}>
            <Route path="/delivery/*" element={<DeliveryApp />} />
          </Route>
          <Route element={<RoleGuard allowed={["restaurant"]} />}>
            <Route path="/restaurant/*" element={<RestaurantApp />} />
          </Route>
          <Route element={<RoleGuard allowed={["admin"]} />}>
            <Route path="/admin/*" element={<AdminPanel />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  )
}
