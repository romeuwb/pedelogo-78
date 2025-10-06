import { Restaurant } from '../../data/sampleData'

export default function RestaurantCard({ r }: { r: Restaurant }) {
  return (
    <div className="rounded-lg border overflow-hidden hover:shadow-delivery transition">
      <div className="h-28 bg-muted animate-pulse-slow" />
      <div className="p-3 space-y-1">
        <div className="font-semibold">{r.name}</div>
        <div className="text-sm opacity-80 flex items-center gap-2">
          <span>⭐ {r.rating.toFixed(1)}</span>
          <span>• {r.etaMin}-{r.etaMax} min</span>
          <span>• Entrega R$ {r.deliveryFee.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}
