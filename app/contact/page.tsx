"use client";

import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useFlavor } from "@/context/FlavorContext";

const contactSchema = z.object({
    name: z.string().min(2, "Name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    subject: z.string().min(1, "Please select a subject"),
    flavor: z.string().optional(),
    message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

function ContactContent() {
    const searchParams = useSearchParams();
    const initialSubject = searchParams.get('subject') || "";
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const { currentFlavor } = useFlavor();

    const { register, handleSubmit, formState: { errors } } = useForm<ContactFormData>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            subject: initialSubject
        }
    });

    const onSubmit = async (data: ContactFormData) => {
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });
            if (res.ok) setSubmitted(true);
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
            >
                <div className="w-20 h-20 rounded-full bg-[var(--accent)] mx-auto flex items-center justify-center text-4xl">🍁</div>
                <h2 className="text-4xl font-display">MESSAGE RECEIVED!</h2>
                <p className="text-text-muted">Thanks for reaching out. We'll get back to you within 24–48 hours.</p>
                <button onClick={() => setSubmitted(false)} className="btn-premium">DONE</button>
            </motion.div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen pt-32">
            {/* Left Panel */}
            <section className="bg-bg-card p-12 md:p-24 space-y-12 relative overflow-hidden">
                <div
                    className="absolute inset-0 opacity-10 blur-[100px] pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, var(--accent) 0%, transparent 70%)` }}
                />

                <div className="relative z-10 space-y-6">
                    <p className="font-body text-[var(--accent)] tracking-[0.3em] font-bold text-sm uppercase">Reach Out</p>
                    <h1 className="text-6xl md:text-8xl leading-none">GET IN <br /> TOUCH 🍁</h1>
                    <p className="text-xl text-text-muted font-light max-w-md leading-relaxed">
                        We'd love to hear from you — whether you have a question, feedback, or want to stock Nectola.
                    </p>
                </div>

                <div className="space-y-8 relative z-10">
                    {[
                        { icon: "✉️", label: "Email", value: "hello@nectola.com" },
                        { icon: "🍁", label: "Location", value: "Proudly Canadian" },
                        { icon: "🕒", label: "Response", value: "24–48 Hours" },
                        { icon: "📦", label: "Wholesale", value: "Nationwide Availability" },
                    ].map((item, i) => (
                        <div key={i} className="flex gap-6 items-center">
                            <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center text-2xl border border-[var(--accent)]/20 text-[var(--accent)]">
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-text-muted font-bold">{item.label}</p>
                                <p className="text-lg font-bold">{item.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Right Panel - Form */}
            <section className="p-12 md:p-24 bg-[#0a0a0a]">
                <div className="max-w-lg mx-auto space-y-8">
                    <h2 className="text-3xl font-display tracking-wide">SEND US A MESSAGE</h2>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Name*</label>
                                <input {...register("name")} className={`w-full bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none transition-colors transition-shadow focus:ring-4 focus:ring-[var(--accent)]/10`} />
                                {errors.name && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.name.message}</p>}
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Email*</label>
                                <input {...register("email")} className={`w-full bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none transition-colors transition-shadow focus:ring-4 focus:ring-[var(--accent)]/10`} />
                                {errors.email && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.email.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Subject*</label>
                            <select {...register("subject")} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus:border-[var(--accent)] outline-none appearance-none">
                                <option value="">Select a subject</option>
                                <option value="General Question">General Question</option>
                                <option value="Feedback">Feedback</option>
                                <option value="Wholesale Inquiry">Wholesale Inquiry</option>
                                <option value="Press/Media">Press/Media</option>
                            </select>
                            {errors.subject && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.subject.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs uppercase font-bold text-text-muted tracking-widest">Message*</label>
                            <textarea {...register("message")} rows={5} className={`w-full bg-white/5 border ${errors.message ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 focus:border-[var(--accent)] outline-none transition-colors transition-shadow focus:ring-4 focus:ring-[var(--accent)]/10 resize-none`} />
                            {errors.message && <p className="text-red-500 text-[10px] uppercase font-bold">{errors.message.message}</p>}
                        </div>

                        <div className="pt-4">
                            <button
                                disabled={isSubmitting}
                                type="submit"
                                className="w-full btn-premium disabled:opacity-50 text-white font-bold"
                            >
                                {isSubmitting ? "SENDING..." : "SEND MESSAGE 🍁"}
                            </button>
                        </div>
                    </form>
                </div>
            </section>
        </div>
    );
}

export default function Contact() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center font-display text-4xl">LOADING...</div>}>
            <ContactContent />
        </Suspense>
    );
}
