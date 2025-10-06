export default function DeliveryApp() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Entregador</h2>
      <p className="opacity-80">Módulo base do entregador. Acompanhe entregas, rotas e ganhos.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Minhas entregas</div>
          <p className="text-sm opacity-70">Fila e status das entregas.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Roteirização</div>
          <p className="text-sm opacity-70">Mapa/rota otimizada (placeholder).</p>
        </div>
      </div>
    </div>
  )
}
