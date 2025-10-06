import { Category } from '../../data/sampleData'

type CategoryChipsProps = {
  categories: Category[]
  selected?: string
  onSelect: (id?: string) => void
}

export default function CategoryChips({ categories, selected, onSelect }: CategoryChipsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
      <button
        onClick={() => onSelect(undefined)}
        className={`px-3 py-1 rounded-full border whitespace-nowrap ${!selected ? 'bg-primary text-primary-foreground' : ''}`}
      >
        Tudo
      </button>
      {categories.map(c => (
        <button
          key={c.id}
          onClick={() => onSelect(c.id)}
          className={`px-3 py-1 rounded-full border whitespace-nowrap ${selected === c.id ? 'bg-primary text-primary-foreground' : ''}`}
        >
          {c.name}
        </button>
      ))}
    </div>
  )
}
