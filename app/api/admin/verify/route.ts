import { NextResponse } from 'next/server';

// POST /api/admin/verify — Validate admin secret server-side before granting UI access
export async function POST(request: Request) {
    const adminSecret = request.headers.get('x-admin-secret');
    if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
        return NextResponse.json({ error: 'Invalid secret' }, { status: 401 });
    }
    return NextResponse.json({ ok: true });
}
