export default function ClientApp() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Cliente</h2>
      <p className="opacity-80">Módulo base do cliente. Aqui você poderá listar restaurantes, cardápio e fazer pedidos.</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Explorar restaurantes</div>
          <p className="text-sm opacity-70">Lista/Busca por restaurantes.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Carrinho e checkout</div>
          <p className="text-sm opacity-70">Fluxo de compra básico.</p>
        </div>
      </div>
    </div>
  )
}
