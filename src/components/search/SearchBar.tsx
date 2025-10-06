import { ChangeEvent } from 'react'

type SearchBarProps = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export default function SearchBar({ value, onChange, placeholder }: SearchBarProps) {
  const handle = (e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)
  return (
    <div className="w-full">
      <input
        value={value}
        onChange={handle}
        placeholder={placeholder ?? 'Buscar restaurantes, itens...'}
        className="w-full rounded-full border px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
      />
    </div>
  )
}
