export default function AdminPanel() {
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Admin</h2>
      <p className="opacity-80">Painel administrativo. Gestão de usuários, relatórios e configurações do sistema.</p>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Usuários</div>
          <p className="text-sm opacity-70">Administração e permissões.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Relatórios</div>
          <p className="text-sm opacity-70">KPIs e indicadores.</p>
        </div>
        <div className="rounded-md border p-4">
          <div className="font-semibold mb-1">Configurações</div>
          <p className="text-sm opacity-70">Parâmetros do sistema.</p>
        </div>
      </div>
    </div>
  )
}
