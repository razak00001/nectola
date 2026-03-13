import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function checkAuth(request: Request) {
    return request.headers.get('x-admin-secret') === process.env.ADMIN_SECRET;
}

// PUT /api/events/[id] — Update an event
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = parseInt(params.id);
        const body = await request.json();

        const { data, error } = await supabase
            .from('events')
            .update({
                name: body.name,
                date: body.date,
                year: body.year,
                location: body.location,
                flavor: body.flavor,
                description: body.description,
                more_info_url: body.more_info_url ?? '#',
            })
            .eq('id', id)
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });
        if (!data) return NextResponse.json({ error: 'Event not found' }, { status: 404 });

        return NextResponse.json(data);
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}

// DELETE /api/events/[id] — Delete an event
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    if (!checkAuth(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const id = parseInt(params.id);

    const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, message: `Event ${id} deleted.` });
}
