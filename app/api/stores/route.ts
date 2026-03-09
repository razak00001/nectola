import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Haversine distance formula (in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// GET /api/stores — List all stores (with optional text search & geo sort)
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const userLat = searchParams.get('lat');
    const userLng = searchParams.get('lng');

    let dbQuery = supabase.from('stores').select('*');

    // Text filter
    if (query) {
        dbQuery = dbQuery.or(
            `name.ilike.%${query}%,city.ilike.%${query}%,province.ilike.%${query}%,address.ilike.%${query}%`
        );
    }

    const { data: stores, error } = await dbQuery;

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    let result = stores ?? [];

    // Geo sort
    if (userLat && userLng) {
        const lat = parseFloat(userLat);
        const lng = parseFloat(userLng);
        result = result
            .map(store => ({
                ...store,
                distanceKm: store.lat && store.lng
                    ? getDistance(lat, lng, store.lat, store.lng)
                    : undefined,
            }))
            .sort((a, b) => {
                if (a.distanceKm === undefined) return 1;
                if (b.distanceKm === undefined) return -1;
                return a.distanceKm - b.distanceKm;
            });
    }

    return NextResponse.json(result);
}

// POST /api/stores — Add a new store
export async function POST(request: Request) {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, address, city, province, lat, lng, flavors } = body;

        if (!name || !address || !city || !province) {
            return NextResponse.json(
                { error: 'Missing required fields: name, address, city, province' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('stores')
            .insert([{
                name,
                address,
                city,
                province,
                lat: lat ? parseFloat(lat) : null,
                lng: lng ? parseFloat(lng) : null,
                flavors: flavors ?? [],
            }])
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
