import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function checkAuth(request: Request) {
    return request.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}

// PUT /api/stores/[id] — Update a store
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = parseInt(params.id);
        const body = await request.json();

        const { data, error } = await supabase
            .from('stores')
            .update({
                name: body.name,
                address: body.address,
                city: body.city,
                province: body.province,
                lat: body.lat ? parseFloat(body.lat) : null,
                lng: body.lng ? parseFloat(body.lng) : null,
                flavors: body.flavors ?? [],
            })
            .eq('id', id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: 'Store not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

// DELETE /api/stores/[id] — Delete a store
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    const { error } = await supabase
        .from('stores')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: `Store ${id} deleted.` });
}
