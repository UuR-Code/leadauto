const API_KEY = process.env.GOOGLE_PLACES_API_KEY!
const BASE = "https://places.googleapis.com/v1/places"

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

const FIELD_MASK = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.websiteUri",
  "places.location",
  "places.photos",
  "nextPageToken",
].join(",")

export type SearchResult = {
  places: PlaceResult[]
  totalFound: number
  withWebsite: number
  withoutWebsite: number
}

export async function searchPlaces(
  sector: string,
  city: string,
  district: string,
  maxResults = 100,
  filterNoWebsite = true,
): Promise<SearchResult> {
  const textQuery = `${SECTOR_QUERY[sector] ?? sector} ${district} ${city}`
  const all: PlaceResult[] = []
  let pageToken: string | undefined
  // Fetch up to 3x more to have enough after filtering
  const fetchTarget = filterNoWebsite ? Math.min(maxResults * 3, 60) : maxResults

  while (all.length < fetchTarget) {
    const body: Record<string, unknown> = {
      textQuery,
      languageCode: "tr",
      regionCode: "TR",
      maxResultCount: Math.min(20, fetchTarget - all.length),
    }
    if (pageToken) body.pageToken = pageToken

    const res = await fetch(`${BASE}:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Places API error: ${res.status} ${err}`)
    }

    const data = await res.json()

    for (const place of data.places ?? []) {
      const photoName = place.photos?.[0]?.name
      const photoUrl = photoName
        ? `${BASE}/${photoName.replace("places/", "")}/media?maxWidthPx=800&key=${API_KEY}`
        : undefined

      all.push({
        placeId: place.id,
        name: place.displayName?.text ?? "",
        address: place.formattedAddress ?? "",
        phone: place.nationalPhoneNumber,
        photoUrl,
        lat: place.location?.latitude ?? 0,
        lng: place.location?.longitude ?? 0,
        hasWebsite: !!place.websiteUri,
        website: place.websiteUri,
      })
    }

    pageToken = data.nextPageToken
    if (!pageToken) break

    await new Promise((r) => setTimeout(r, 2000))
  }

  const withWebsite = all.filter((p) => p.hasWebsite).length
  const withoutWebsite = all.filter((p) => !p.hasWebsite).length
  const places = filterNoWebsite
    ? all.filter((p) => !p.hasWebsite).slice(0, maxResults)
    : all.slice(0, maxResults)

  return { places, totalFound: all.length, withWebsite, withoutWebsite }
}

// Legacy export kept for reference
export async function searchPlacesWithoutWebsite(
  sector: string,
  city: string,
  district: string,
  maxResults = 100,
): Promise<PlaceResult[]> {
  const result = await searchPlaces(sector, city, district, maxResults, true)
  return result.places
}
