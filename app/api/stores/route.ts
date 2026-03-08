import { NextResponse } from 'next/server';

const MOCK_STORES = [
    { id: 1, name: "Fresh Market Toronto", address: "123 Queen St W", city: "Toronto", province: "ON", lat: 43.65107, lng: -79.387015, flavors: ["necto", "cream"] },
    { id: 2, name: "Vancouver Craft Sodas", address: "456 Main St", city: "Vancouver", province: "BC", lat: 49.2811, lng: -123.0991, flavors: ["necto", "ginger", "pineapple"] },
    { id: 3, name: "Montreal Retro Drinks", address: "789 Rue Sherbrooke", city: "Montreal", province: "QC", lat: 45.5035, lng: -73.5738, flavors: ["necto", "cream", "ginger", "pineapple"] },
    { id: 4, name: "Calgary Artisan Goods", address: "101 8th Ave SW", city: "Calgary", province: "AB", lat: 51.0447, lng: -114.0631, flavors: ["ginger", "pineapple"] },
];

// Haversine distance formula (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userLat = searchParams.get('lat');
    const userLng = searchParams.get('lng');

    let stores = [...MOCK_STORES];

    // Filter by text query if provided
    if (query) {
        stores = stores.filter(s =>
            s.city.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    // Sort by distance if user coords are provided
    if (userLat && userLng) {
        const lat = parseFloat(userLat);
        const lng = parseFloat(userLng);

        stores = stores.map(store => ({
            ...store,
            distanceKm: store.lat && store.lng ? getDistance(lat, lng, store.lat, store.lng) : undefined
        })).sort((a, b) => {
            if (a.distanceKm === undefined) return 1;
            if (b.distanceKm === undefined) return -1;
            return a.distanceKm - b.distanceKm;
        });
    }

    return NextResponse.json(stores);
}
