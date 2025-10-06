export type Category = {
  id: string
  name: string
  icon?: string
}

export type MenuItem = {
  id: string
  name: string
  price: number
  categoryId: string
}

export type Restaurant = {
  id: string
  name: string
  categories: string[]
  rating: number
  etaMin: number
  etaMax: number
  deliveryFee: number
  highlight?: boolean
  items: MenuItem[]
}

export const categories: Category[] = [
  { id: 'pizza', name: 'Pizza' },
  { id: 'burger', name: 'Lanches' },
  { id: 'jap', name: 'Japonesa' },
  { id: 'dessert', name: 'Doces' },
  { id: 'healthy', name: 'Saudável' },
  { id: 'market', name: 'Mercado' },
]

export const restaurants: Restaurant[] = [
  {
    id: 'r1',
    name: 'Praça da Pizza',
    categories: ['pizza'],
    rating: 4.7,
    etaMin: 25,
    etaMax: 40,
    deliveryFee: 6.9,
    highlight: true,
    items: [
      { id: 'i1', name: 'Pizza Margherita', price: 39.9, categoryId: 'pizza' },
      { id: 'i2', name: 'Pizza Calabresa', price: 42.9, categoryId: 'pizza' },
    ],
  },
  {
    id: 'r2',
    name: 'Burger House',
    categories: ['burger'],
    rating: 4.5,
    etaMin: 20,
    etaMax: 35,
    deliveryFee: 5.9,
    items: [
      { id: 'i3', name: 'Cheeseburger', price: 24.9, categoryId: 'burger' },
      { id: 'i4', name: 'Duplo Bacon', price: 29.9, categoryId: 'burger' },
    ],
  },
  {
    id: 'r3',
    name: 'Sakura Sushi',
    categories: ['jap'],
    rating: 4.8,
    etaMin: 30,
    etaMax: 45,
    deliveryFee: 9.9,
    items: [
      { id: 'i5', name: 'Combo Sushi 20 peças', price: 59.9, categoryId: 'jap' },
      { id: 'i6', name: 'Uramaki Salmão', price: 34.9, categoryId: 'jap' },
    ],
  },
]

export type SearchResult = {
  type: 'restaurant' | 'item'
  restaurant: Restaurant
  item?: MenuItem
}

export function searchAll(query: string, categoryId?: string): SearchResult[] {
  const q = query.trim().toLowerCase()
  const byCategory = (r: Restaurant) => (categoryId ? r.categories.includes(categoryId) : true)

  if (!q && !categoryId) {
    // Retorna destaques (sem filtro)
    return restaurants
      .filter(r => r.highlight)
      .map(r => ({ type: 'restaurant', restaurant: r } as SearchResult))
  }

  const results: SearchResult[] = []

  for (const r of restaurants.filter(byCategory)) {
    if (!q) {
      results.push({ type: 'restaurant', restaurant: r })
      continue
    }

    const nameMatch = r.name.toLowerCase().includes(q)
    if (nameMatch) {
      results.push({ type: 'restaurant', restaurant: r })
    }

    for (const it of r.items) {
      if (it.name.toLowerCase().includes(q)) {
        results.push({ type: 'item', restaurant: r, item: it })
      }
    }
  }

  return results
}
