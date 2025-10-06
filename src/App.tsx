import { Link, Route, Routes } from 'react-router-dom'

import ClientApp from './pages/ClientApp'
import DeliveryApp from './pages/DeliveryApp'
import RestaurantApp from './pages/RestaurantApp'
import AdminPanel from './pages/AdminPanel'

function Home() {
  return (
    <div className="p-6 space-y-6">
      <section>
        <h2 className="text-2xl font-bold mb-4">Escolha um módulo</h2>
        <nav className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/client" className="rounded-md p-4 border hover:bg-muted transition shadow-delivery">
            <div className="font-semibold">Cliente</div>
            <div className="text-sm opacity-70">Explorar restaurantes e fazer pedidos</div>
          </Link>
          <Link to="/delivery" className="rounded-md p-4 border hover:bg-muted transition">
            <div className="font-semibold">Entregador</div>
            <div className="text-sm opacity-70">Ver entregas e rotas</div>
          </Link>
          <Link to="/restaurant" className="rounded-md p-4 border hover:bg-muted transition">
            <div className="font-semibold">Restaurante</div>
            <div className="text-sm opacity-70">Gerenciar cardápio e pedidos</div>
          </Link>
          <Link to="/admin" className="rounded-md p-4 border hover:bg-muted transition">
            <div className="font-semibold">Admin</div>
            <div className="text-sm opacity-70">Painel administrativo</div>
          </Link>
        </nav>
      </section>

      <section className="space-y-2">
        <h3 className="text-xl font-semibold">Tema</h3>
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-primary text-primary-foreground">primary</span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-accent text-accent-foreground">accent</span>
          <span className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-secondary text-secondary-foreground">secondary</span>
        </div>
        <p className="text-sm opacity-80">Fonte padrão do tema ativa (Inter + fallbacks).</p>
      </section>
    </div>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="p-6 border-b flex items-center justify-between">
        <h1 className="text-2xl font-bold">PedeLogo</h1>
        <span className="px-3 py-1 rounded-md bg-primary text-primary-foreground text-sm">Padrão visual preservado</span>
      </header>

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/client/*" element={<ClientApp />} />
          <Route path="/delivery/*" element={<DeliveryApp />} />
          <Route path="/restaurant/*" element={<RestaurantApp />} />
          <Route path="/admin/*" element={<AdminPanel />} />
        </Routes>
      </main>
    </div>
  )
}
