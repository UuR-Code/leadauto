const PLACES_BASE = "https://maps.googleapis.com/maps/api/place"
const API_KEY = process.env.GOOGLE_PLACES_API_KEY!

export type PlaceResult = {
  placeId: string
  name: string
  address: string
  phone?: string
  photoUrl?: string
  lat: number
  lng: number
  hasWebsite: boolean
  website?: string
}

const SECTOR_QUERY: Record<string, string> = {
  restaurant:   "restoran",
  barber:       "kuaför berber",
  auto_service: "oto servis",
  dentist:      "diş hekimi klinik",
  gym:          "spor salonu fitness",
  hotel:        "otel pansiyon",
  cafe:         "kafe kahve",
  pharmacy:     "eczane",
}

export async function searchPlacesWithoutWebsite(
  sector: string,
  city: string,
  district: string,
  maxResults = 100,
): Promise<PlaceResult[]> {
  const query = `${SECTOR_QUERY[sector] ?? sector} ${district} ${city}`
  const results: PlaceResult[] = []
  let pageToken: string | undefined

  while (results.length < maxResults) {
    const params = new URLSearchParams({
      query,
      key: API_KEY,
      language: "tr",
      region: "tr",
      ...(pageToken ? { pagetoken: pageToken } : {}),
    })

    const res = await fetch(`${PLACES_BASE}/textsearch/json?${params}`)
    const data = await res.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Places API error: ${data.status}`)
    }

    for (const place of data.results ?? []) {
      const detail = await getPlaceDetail(place.place_id)
      if (!detail.hasWebsite) {
        results.push(detail)
      }
      if (results.length >= maxResults) break
    }

    pageToken = data.next_page_token
    if (!pageToken) break

    // Places API requires a short wait before using next_page_token
    await new Promise((r) => setTimeout(r, 2000))
  }

  return results
}

async function getPlaceDetail(placeId: string): Promise<PlaceResult> {
  const params = new URLSearchParams({
    place_id: placeId,
    fields: "place_id,name,formatted_address,formatted_phone_number,website,geometry,photos",
    key: API_KEY,
    language: "tr",
  })

  const res = await fetch(`${PLACES_BASE}/details/json?${params}`)
  const data = await res.json()
  const p = data.result

  const photoRef = p.photos?.[0]?.photo_reference
  const photoUrl = photoRef
    ? `${PLACES_BASE}/photo?maxwidth=800&photo_reference=${photoRef}&key=${API_KEY}`
    : undefined

  return {
    placeId: p.place_id,
    name: p.name,
    address: p.formatted_address,
    phone: p.formatted_phone_number,
    photoUrl,
    lat: p.geometry?.location?.lat,
    lng: p.geometry?.location?.lng,
    hasWebsite: !!p.website,
    website: p.website,
  }
}
