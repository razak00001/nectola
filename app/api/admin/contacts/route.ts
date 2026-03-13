import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

const ADMIN_SECRET = process.env.ADMIN_SECRET;

function isValidAdmin(req: Request) {
    const authHeader = req.headers.get('authorization');
    const xSecret = req.headers.get('x-admin-secret');
    
    if (authHeader === `Bearer ${ADMIN_SECRET}`) return true;
    if (xSecret === ADMIN_SECRET) return true;
    
    return false;
}

export async function GET(request: Request) {
    if (!isValidAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { data, error } = await supabase
            .from('contacts')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    if (!isValidAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const url = new URL(request.url);
        const id = url.searchParams.get('id');

        console.log("Admin DELETE message request - ID:", id);

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('contacts')
            .delete()
            .eq('id', id);

        if (error) {
            console.error("Supabase DELETE error:", error);
            throw error;
        }
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("API DELETE error:", error);
        return NextResponse.json({ error: error.message || 'Failed to delete contact' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    if (!isValidAdmin(request)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { id, is_read } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const { error } = await supabase
            .from('contacts')
            .update({ is_read })
            .eq('id', id);

        if (error) throw error;
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update contact' }, { status: 500 });
    }
}
