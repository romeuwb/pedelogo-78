import { useNavigate } from 'react-router-dom'
import { Role, setRole, getRole, clearRole } from '../auth/auth'

const roles: { id: Role; label: string }[] = [
  { id: 'client', label: 'Cliente' },
  { id: 'delivery', label: 'Entregador' },
  { id: 'restaurant', label: 'Restaurante' },
  { id: 'admin', label: 'Admin' },
]

export default function Login() {
  const nav = useNavigate()
  const current = getRole()

  const choose = (r: Role) => {
    setRole(r)
    // Redireciona para o painel do perfil
    const path = r === 'client' ? '/client' : r === 'delivery' ? '/delivery' : r === 'restaurant' ? '/restaurant' : '/admin'
    nav(path, { replace: true })
  }

  const logout = () => {
    clearRole()
    nav('/', { replace: true })
  }

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-2xl font-bold">Escolher acesso</h2>
      {current && (
        <div className="text-sm opacity-80">Acesso atual: <span className="font-medium">{current}</span></div>
      )}
      <div className="grid gap-3">
        {roles.map(r => (
          <button key={r.id} onClick={() => choose(r.id)} className="rounded-md border px-4 py-2 text-left hover:bg-muted">
            <div className="font-semibold">{r.label}</div>
            <div className="text-sm opacity-70">Entrar como {r.label.toLowerCase()}</div>
          </button>
        ))}
      </div>
      {current && (
        <button onClick={logout} className="text-sm text-destructive underline">Sair</button>
      )}
    </div>
  )
}
