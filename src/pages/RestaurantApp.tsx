export default function RestaurantApp() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Restaurante</h2>
      <p className="opacity-80">Módulo do restaurante. Gerencie cardápio, pedidos e horários.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Cardápio</div>
          <p className="text-sm opacity-70">Categorias e produtos.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Pedidos</div>
          <p className="text-sm opacity-70">Gerenciamento de pedidos.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Configurações</div>
          <p className="text-sm opacity-70">Dados gerais do restaurante.</p>
        </div>
      </div>
    </div>
  )
}
