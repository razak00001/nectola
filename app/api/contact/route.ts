import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, phone, subject, message } = body;

        // 1. Save to Supabase
        const { error } = await supabase
            .from('contacts')
            .insert([{ name, email, phone, subject, message }]);

        if (error) {
            console.error("Supabase Error:", error);
            throw error;
        }

        return NextResponse.json({ success: true, message: "Message sent! We'll get back to you soon. 🍁" });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ success: false, error: "Failed to send message." }, { status: 500 });
    }
}
