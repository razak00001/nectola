import { NextResponse } from 'next/server';

const MOCK_STORES = [
    { id: 1, name: "Fresh Market Toronto", address: "123 Queen St W", city: "Toronto", province: "ON", flavors: ["necto", "cream"] },
    { id: 2, name: "Vancouver Craft Sodas", address: "456 Main St", city: "Vancouver", province: "BC", flavors: ["necto", "ginger", "pineapple"] },
    { id: 3, name: "Montreal Retro Drinks", address: "789 Rue Sherbrooke", city: "Montreal", province: "QC", flavors: ["necto", "cream", "ginger", "pineapple"] },
    { id: 4, name: "Calgary Artisan Goods", address: "101 8th Ave SW", city: "Calgary", province: "AB", flavors: ["ginger", "pineapple"] },
];

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    // Basic mock filtering
    let stores = MOCK_STORES;
    if (query) {
        stores = MOCK_STORES.filter(s =>
            s.city.toLowerCase().includes(query.toLowerCase()) ||
            s.name.toLowerCase().includes(query.toLowerCase())
        );
    }

    return NextResponse.json(stores);
}
