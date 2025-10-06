export type Role = 'client' | 'delivery' | 'restaurant' | 'admin'

const KEY = 'pedelogo_role'

export function setRole(role: Role) {
  localStorage.setItem(KEY, role)
}

export function getRole(): Role | null {
  const v = localStorage.getItem(KEY)
  return (v as Role) ?? null
}

export function clearRole() {
  localStorage.removeItem(KEY)
}
