import { useEffect, useMemo, useState } from 'react'
import SearchBar from '../components/search/SearchBar'
import CategoryChips from '../components/categories/CategoryChips'
import RestaurantCard from '../components/restaurants/RestaurantCard'
import { categories, restaurants, searchAll, SearchResult } from '../data/sampleData'

export default function Home() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [results, setResults] = useState<SearchResult[]>([])

  useEffect(() => {
    setResults(searchAll(query, category))
  }, [query, category])

  const onlyRestaurants = useMemo(() => results.filter(r => r.type === 'restaurant'), [results])
  const itemsMatches = useMemo(() => results.filter(r => r.type === 'item'), [results])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b">
        <div className="max-w-5xl mx-auto px-4 py-3 space-y-3">
          <div className="text-sm opacity-70">Entregar em</div>
          <div className="flex items-center justify-between">
            <div className="font-semibold">Seu endereço</div>
            <button className="text-sm text-primary">Alterar</button>
          </div>
          <SearchBar value={query} onChange={setQuery} placeholder="Buscar restaurantes e itens" />
          <CategoryChips categories={categories} selected={category} onSelect={setCategory} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-4 space-y-8">
        <section className="space-y-3">
          <div className="h-32 rounded-xl gradient-delivery shadow-delivery" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {restaurants.filter(r => r.highlight).map(r => (
              <RestaurantCard key={r.id} r={r} />
            ))}
          </div>
        </section>

        {!!itemsMatches.length && (
          <section className="space-y-2">
            <h3 className="text-lg font-semibold">Itens encontrados</h3>
            <ul className="space-y-1 text-sm">
              {itemsMatches.map((m, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-muted">{m.item!.name}</span>
                  <span className="opacity-70">em</span>
                  <span className="font-medium">{m.restaurant.name}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="space-y-3">
          <h3 className="text-lg font-semibold">Restaurantes</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {onlyRestaurants.map((m, idx) => (
              <RestaurantCard key={`${m.restaurant.id}-${idx}`} r={m.restaurant} />
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
