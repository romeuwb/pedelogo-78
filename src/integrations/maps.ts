let mapsPromise: Promise<void> | null = null

export function loadGoogleMaps(apiKey?: string) {
  if (!apiKey || typeof window === 'undefined') return Promise.resolve()
  if (mapsPromise) return mapsPromise

  mapsPromise = new Promise((resolve, reject) => {
    if ((window as any).google?.maps) return resolve()

    const s = document.createElement('script')
    s.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(s)
  })

  return mapsPromise
}
