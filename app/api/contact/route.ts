import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        console.log("Form Submission:", body);

        // 1. Validate reCAPTCHA (Stub)
        // 2. Save to Supabase (Stub)
        // 3. Send email via Klaviyo/Resend (Stub)

        return NextResponse.json({ success: true, message: "Message sent! We'll get back to you soon. 🍁" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to send message." }, { status: 500 });
    }
}
