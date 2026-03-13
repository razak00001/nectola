import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET /api/events — List all events
export async function GET() {
    const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .order('id', { ascending: true });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(events ?? []);
}

// POST /api/events — Add a new event
export async function POST(request: Request) {
    const adminSecret = request.headers.get('x-admin-secret');
    if (adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, date, year, location, flavor, description, more_info_url } = body;

        if (!name || !date || !year || !location) {
            return NextResponse.json(
                { error: 'Missing required fields: name, date, year, location' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('events')
            .insert([{
                name,
                date,
                year,
                location,
                flavor,
                description,
                more_info_url: more_info_url ?? '#',
            }])
            .select()
            .single();

        if (error) return NextResponse.json({ error: error.message }, { status: 500 });

        return NextResponse.json(data, { status: 201 });
    } catch {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
