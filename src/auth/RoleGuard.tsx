import { Navigate, Outlet } from 'react-router-dom'
import { getRole, Role } from './auth'

export default function RoleGuard({ allowed }: { allowed: Role[] }) {
  const role = getRole()
  if (!role || !allowed.includes(role)) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
