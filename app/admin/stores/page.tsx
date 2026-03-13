"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Plus, Trash2, Pencil, X, Check, Lock, Store, Loader2, Calendar, Mail, MessageSquare, CheckCircle } from "lucide-react";

const ALL_FLAVORS = ["necto", "cream", "ginger", "pineapple"];

const FLAVOR_COLORS: Record<string, string> = {
    necto: "#f97316",
    cream: "#fde68a",
    ginger: "#ca8a04",
    pineapple: "#84cc16",
};

const emptyStoreForm = {
    name: "",
    address: "",
    city: "",
    province: "",
    lat: "",
    lng: "",
    flavors: [] as string[],
};

const emptyEventForm = {
    name: "",
    date: "",
    year: "2025",
    location: "",
    flavor: "necto",
    description: "",
    more_info_url: "#",
};

interface NominatimResult {
    place_id: number;
    display_name: string;
    lat: string;
    lon: string;
    address: {
        house_number?: string;
        road?: string;
        city?: string;
        town?: string;
        village?: string;
        state?: string;
        province?: string;
        state_code?: string;
        postcode?: string;
        country?: string;
    };
}

// Debounce helper
function useDebounce<T>(value: T, delay: number) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

export default function AdminStoresPage() {
    const [secret, setSecret] = useState("");
    const [authed, setAuthed] = useState(false);
    const [authError, setAuthError] = useState("");
    const [verifying, setVerifying] = useState(false);

    const [activeTab, setActiveTab] = useState<"stores" | "events" | "messages">("stores");

    const [stores, setStores] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [storeForm, setStoreForm] = useState(emptyStoreForm);
    const [eventForm, setEventForm] = useState(emptyEventForm);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    // Address autocomplete state
    const [addressQuery, setAddressQuery] = useState("");
    const [suggestions, setSuggestions] = useState<NominatimResult[]>([]);
    const [suggestLoading, setSuggestLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const debouncedQuery = useDebounce(addressQuery, 400);
    const suggestionRef = useRef<HTMLDivElement>(null);

    // Fetch suggestions from Nominatim
    useEffect(() => {
        if (debouncedQuery.length < 3) {
            setSuggestions([]);
            return;
        }
        setSuggestLoading(true);
        fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(debouncedQuery)}&countrycodes=ca&format=json&addressdetails=1&limit=6`,
            { headers: { "Accept-Language": "en" } }
        )
            .then(r => r.json())
            .then(data => {
                setSuggestions(data);
                setShowSuggestions(true);
            })
            .catch(() => setSuggestions([]))
            .finally(() => setSuggestLoading(false));
    }, [debouncedQuery]);

    // Close suggestions on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (suggestionRef.current && !suggestionRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const handleSelectSuggestion = (item: NominatimResult) => {
        const addr = item.address;
        const streetParts = [addr.house_number, addr.road].filter(Boolean);
        const street = streetParts.join(" ");
        const city = addr.city || addr.town || addr.village || "";
        // Prefer state_code (e.g. "ON") over full state name
        const province = addr.state_code?.replace(/^CA-/, "") || addr.province || addr.state || "";

        setAddressQuery(street || item.display_name);
        setStoreForm(f => ({
            ...f,
            address: street || item.display_name,
            city,
            province,
            lat: parseFloat(item.lat).toFixed(6),
            lng: parseFloat(item.lon).toFixed(6),
        }));
        setSuggestions([]);
        setShowSuggestions(false);
    };

    useEffect(() => {
        if (authed) {
            fetchStores();
            fetchEvents();
            fetchMessages();
        }
    }, [authed]);

    // Sync addressQuery → storeForm.address when editing
    useEffect(() => {
        setAddressQuery(storeForm.address);
    }, [editingId, storeForm.address]); 

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!secret.trim()) { setAuthError("Please enter the admin secret."); return; }
        setVerifying(true);
        setAuthError("");
        try {
            const res = await fetch('/api/admin/verify', {
                method: 'POST',
                headers: { 'x-admin-secret': secret },
            });
            if (res.ok) {
                setAuthed(true);
            } else {
                setAuthError("Incorrect secret. Access denied.");
                setSecret("");
            }
        } catch {
            setAuthError("Unable to connect. Please try again.");
        } finally {
            setVerifying(false);
        }
    };

    const fetchStores = async () => {
        setLoading(true);
        const res = await fetch("/api/stores");
        setStores(await res.json());
        setLoading(false);
    };

    const fetchMessages = async () => {
        setLoading(true);
        const res = await fetch("/api/admin/contacts", {
            headers: { "Authorization": `Bearer ${secret}` }
        });
        if (res.ok) setMessages(await res.json());
        setLoading(false);
    };

    const fetchEvents = async () => {
        setLoading(true);
        const res = await fetch("/api/events");
        setEvents(await res.json());
        setLoading(false);
    };

    const notify = (msg: string, isError = false) => {
        if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 3500); }
        else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const isStore = activeTab === "stores";
        const isEditing = editingId !== null;

        const endpoint = isStore 
            ? (isEditing ? `/api/stores/${editingId}` : "/api/stores")
            : (isEditing ? `/api/events/${editingId}` : "/api/events");

        const payload = isStore ? {
            ...storeForm,
            address: addressQuery || storeForm.address,
            lat: storeForm.lat ? parseFloat(storeForm.lat) : undefined,
            lng: storeForm.lng ? parseFloat(storeForm.lng) : undefined,
        } : eventForm;

        const res = await fetch(endpoint, {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json", "x-admin-secret": secret },
            body: JSON.stringify(payload),
        });

        if (res.ok) {
            notify(isEditing ? `${isStore ? "Store" : "Event"} updated!` : `${isStore ? "Store" : "Event"} added!`);
            if (isStore) {
                setStoreForm(emptyStoreForm);
                setAddressQuery("");
                fetchStores();
            } else {
                setEventForm(emptyEventForm);
                fetchEvents();
            }
            setEditingId(null);
        } else {
            const data = await res.json();
            notify(data.error || "Something went wrong.", true);
        }
        setSubmitting(false);
    };

    const handleEditStore = (store: any) => {
        setEditingId(store.id);
        const f = {
            name: store.name,
            address: store.address,
            city: store.city,
            province: store.province,
            lat: store.lat?.toString() ?? "",
            lng: store.lng?.toString() ?? "",
            flavors: store.flavors ?? [],
        };
        setStoreForm(f);
        setAddressQuery(store.address);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleEditEvent = (event: any) => {
        setEditingId(event.id);
        setEventForm({
            name: event.name,
            date: event.date,
            year: event.year,
            location: event.location,
            flavor: event.flavor || "necto",
            description: event.description || "",
            more_info_url: event.more_info_url || "#",
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDeleteStore = async (id: number) => {
        if (!confirm("Delete this store?")) return;
        const res = await fetch(`/api/stores/${id}`, { method: "DELETE", headers: { "x-admin-secret": secret } });
        if (res.ok) { notify("Store deleted."); fetchStores(); }
        else notify("Failed to delete.", true);
    };

    const handleDeleteEvent = async (id: number) => {
        if (!confirm("Delete this event?")) return;
        const res = await fetch(`/api/events/${id}`, { method: "DELETE", headers: { "x-admin-secret": secret } });
        if (res.ok) { notify("Event deleted."); fetchEvents(); }
        else notify("Failed to delete.", true);
    };

    const handleDeleteMessage = async (id: number | string) => {
        if (!id) return;
        if (!confirm("Delete this message permanently?")) return;
        
        try {
            const res = await fetch(`/api/admin/contacts?id=${id}`, { 
                method: "DELETE", 
                headers: { "x-admin-secret": secret } 
            });
            
            if (res.ok) { 
                notify("Message deleted successfully."); 
                fetchMessages(); 
            } else {
                const data = await res.json().catch(() => ({}));
                notify(data.error || "Failed to delete message.", true);
            }
        } catch (err) {
            console.error("Delete error:", err);
            notify("Network error. Please try again.", true);
        }
    };

    const handleToggleRead = async (message: any) => {
        const res = await fetch(`/api/admin/contacts`, {
            method: "PATCH",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${secret}` 
            },
            body: JSON.stringify({ id: message.id, is_read: !message.is_read })
        });
        if (res.ok) fetchMessages();
        else notify("Failed to update status.", true);
    };

    const toggleFlavor = (flavor: string) => {
        setStoreForm(f => ({
            ...f,
            flavors: f.flavors.includes(flavor) ? f.flavors.filter(x => x !== flavor) : [...f.flavors, flavor],
        }));
    };

    // --- AUTH SCREEN ---
    if (!authed) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <form onSubmit={handleLogin} className="bg-[#111] border border-white/10 rounded-3xl p-10 w-full max-w-sm flex flex-col gap-6 shadow-2xl">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                            <Lock className="w-5 h-5 text-orange-400" />
                        </div>
                        <h1 className="text-xl font-bold text-white tracking-widest uppercase">Admin Access</h1>
                    </div>
                    <p className="text-sm text-white/40 -mt-2">Enter the admin secret to manage store locations.</p>
                    <input
                        type="password"
                        placeholder="Admin secret..."
                        value={secret}
                        onChange={e => setSecret(e.target.value)}
                        disabled={verifying}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors disabled:opacity-50"
                    />
                    {authError && (
                        <p className="text-red-400 text-sm flex items-center gap-2">
                            <span>⛔</span> {authError}
                        </p>
                    )}
                    <button
                        type="submit"
                        disabled={verifying}
                        className="bg-orange-500 hover:bg-orange-400 disabled:opacity-60 text-white font-bold py-3 rounded-xl tracking-widest uppercase transition-colors"
                    >
                        {verifying ? "Verifying..." : "Enter"}
                    </button>
                </form>
            </div>
        );
    }

    // --- ADMIN DASHBOARD ---
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-24 pb-24">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-12">

                {/* Header & Tabs */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 md:mb-12">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                            {activeTab === "stores" ? <Store className="w-5 h-5 md:w-6 md:h-6 text-orange-400" /> : 
                             activeTab === "events" ? <Calendar className="w-5 h-5 md:w-6 md:h-6 text-orange-400" /> :
                             <Mail className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />}
                        </div>
                        <div>
                            <h1 className="text-xl md:text-3xl font-bold tracking-tight">
                                {activeTab === "stores" ? "Store Locations" : 
                                 activeTab === "events" ? "Events Management" : 
                                 "Messages"}
                            </h1>
                            <p className="text-white/40 text-[10px] md:text-sm mt-0.5">
                                {activeTab === "stores" ? "Add, edit, or remove retail store locations" : 
                                 activeTab === "events" ? "Manage upcoming Nectola events" :
                                 "Customer feedback and inquiries"}
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5 overflow-x-auto no-scrollbar max-w-full">
                        <button
                            onClick={() => { setActiveTab("stores"); setEditingId(null); }}
                            className={`whitespace-nowrap px-5 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-bold tracking-widest uppercase transition-all ${activeTab === "stores" ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            Stores
                        </button>
                        <button
                            onClick={() => { setActiveTab("events"); setEditingId(null); }}
                            className={`whitespace-nowrap px-5 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-bold tracking-widest uppercase transition-all ${activeTab === "events" ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            Events
                        </button>
                        <button
                            onClick={() => { setActiveTab("messages"); setEditingId(null); }}
                            className={`whitespace-nowrap px-5 md:px-6 py-2 rounded-xl text-[10px] md:text-sm font-bold tracking-widest uppercase transition-all ${activeTab === "messages" ? "bg-orange-500 text-white shadow-lg" : "text-white/40 hover:text-white/60"}`}
                        >
                            Messages
                        </button>
                    </div>
                </div>

                {/* Toasts */}
                {successMsg && (
                    <div className="mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/20 text-green-400 px-5 py-4 rounded-2xl">
                        <Check className="w-5 h-5" />{successMsg}
                    </div>
                )}
                {errorMsg && (
                    <div className="mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl">
                        <X className="w-5 h-5" />{errorMsg}
                    </div>
                )}

                {/* Add / Edit Form (Not for messages) */}
                {activeTab !== "messages" && (
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-12 shadow-xl">
                        <h2 className="text-lg font-bold tracking-widest uppercase mb-6 text-white/80">
                            {editingId !== null ? `Editing ${activeTab === "stores" ? "Store" : "Event"} #${editingId}` : `Add New ${activeTab === "stores" ? "Store" : "Event"}`}
                        </h2>

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {activeTab === "stores" ? (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Store Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Fresh Market Toronto"
                                            value={storeForm.name}
                                            onChange={e => setStoreForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2 relative" ref={suggestionRef}>
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">
                                            Street Address *
                                            {suggestLoading && <Loader2 className="inline ml-2 w-3 h-3 animate-spin text-orange-400" />}
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Start typing an address…"
                                            value={addressQuery}
                                            onChange={e => {
                                                setAddressQuery(e.target.value);
                                                setStoreForm(f => ({ ...f, address: e.target.value }));
                                                setShowSuggestions(true);
                                            }}
                                            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                            required
                                            autoComplete="off"
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />

                                        {showSuggestions && suggestions.length > 0 && (
                                            <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
                                                {suggestions.map(item => (
                                                    <button
                                                        key={item.place_id}
                                                        type="button"
                                                        onMouseDown={() => handleSelectSuggestion(item)}
                                                        className="w-full text-left px-4 py-3 text-sm hover:bg-white/5 transition-colors flex items-start gap-3 border-b border-white/5 last:border-0"
                                                    >
                                                        <MapPin className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                                        <span className="text-white/80 leading-snug">{item.display_name}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">City *</label>
                                        <input
                                            type="text"
                                            value={storeForm.city}
                                            onChange={e => setStoreForm(f => ({ ...f, city: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Province *</label>
                                        <input
                                            type="text"
                                            value={storeForm.province}
                                            onChange={e => setStoreForm(f => ({ ...f, province: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Latitude</label>
                                        <input
                                            type="text"
                                            value={storeForm.lat}
                                            onChange={e => setStoreForm(f => ({ ...f, lat: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm font-mono"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Longitude</label>
                                        <input
                                            type="text"
                                            value={storeForm.lng}
                                            onChange={e => setStoreForm(f => ({ ...f, lng: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm font-mono"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Flavors Available</label>
                                        <div className="flex gap-3 flex-wrap">
                                            {ALL_FLAVORS.map(f => (
                                                <button
                                                    key={f}
                                                    type="button"
                                                    onClick={() => toggleFlavor(f)}
                                                    className={`px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase border transition-all ${storeForm.flavors.includes(f) ? 'border-transparent text-black' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                                                    style={storeForm.flavors.includes(f) ? { backgroundColor: FLAVOR_COLORS[f] } : {}}
                                                >
                                                    {f}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Event Name *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Toronto Summer Fest"
                                            value={eventForm.name}
                                            onChange={e => setEventForm(f => ({ ...f, name: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Location *</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. Trinity Bellwoods Park"
                                            value={eventForm.location}
                                            onChange={e => setEventForm(f => ({ ...f, location: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Date (e.g. JUL 12) *</label>
                                        <input
                                            type="text"
                                            placeholder="JUL 12"
                                            value={eventForm.date}
                                            onChange={e => setEventForm(f => ({ ...f, date: e.target.value.toUpperCase() }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Year *</label>
                                        <input
                                            type="text"
                                            placeholder="2025"
                                            value={eventForm.year}
                                            onChange={e => setEventForm(f => ({ ...f, year: e.target.value }))}
                                            required
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Featured Flavor</label>
                                        <select
                                            value={eventForm.flavor}
                                            onChange={e => setEventForm(f => ({ ...f, flavor: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm appearance-none"
                                        >
                                            {ALL_FLAVORS.map(f => <option key={f} value={f} className="bg-[#111]">{f}</option>)}
                                        </select>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">More Info URL</label>
                                        <input
                                            type="text"
                                            placeholder="#"
                                            value={eventForm.more_info_url}
                                            onChange={e => setEventForm(f => ({ ...f, more_info_url: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="text-xs font-bold uppercase tracking-widest text-white/40">Description</label>
                                        <textarea
                                            placeholder="Brief event description..."
                                            value={eventForm.description}
                                            onChange={e => setEventForm(f => ({ ...f, description: e.target.value }))}
                                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm min-h-[100px]"
                                        />
                                    </div>
                                </>
                            )}

                            <div className="md:col-span-2 flex flex-col sm:flex-row gap-3">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl tracking-widest uppercase transition-all shadow-lg active:scale-95"
                                >
                                    <Plus className="w-4 h-4" />
                                    {submitting ? "Saving..." : editingId !== null ? `Update ${activeTab === "stores" ? "Store" : "Event"}` : `Add ${activeTab === "stores" ? "Store" : "Event"}`}
                                </button>
                                {editingId !== null && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setEditingId(null);
                                            if (activeTab === "stores") { setStoreForm(emptyStoreForm); setAddressQuery(""); }
                                            else setEventForm(emptyEventForm);
                                        }}
                                        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-bold py-3 px-6 rounded-xl tracking-widest uppercase transition-colors"
                                    >
                                        <X className="w-4 h-4" /> Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>
                )}

                {/* List Section */}
                <h2 className="text-lg font-bold tracking-widest uppercase mb-6 text-white/80">
                    {activeTab === "messages" ? `Inquiries (${messages.length})` : 
                     activeTab === "stores" ? `All Stores (${stores.length})` : `Upcoming Events (${events.length})`}
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-40 rounded-3xl bg-white/5 animate-pulse border border-white/5" />)}
                    </div>
                ) : activeTab === "messages" ? (
                    messages.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-white/30 uppercase tracking-widest text-sm bg-white/[0.02]">
                            No messages yet.
                        </div>
                    ) : (
                        <div className="flex flex-col gap-4">
                            {messages.map(msg => (
                                <div key={msg.id} className={`bg-[#111] border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 transition-all hover:bg-[#151515] ${msg.is_read ? 'border-white/5 opacity-60' : 'border-orange-500/30 bg-[#161616] shadow-lg shadow-orange-500/5'}`}>
                                    <div className="flex-1 space-y-4">
                                        <div className="flex flex-wrap items-center gap-3">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${msg.is_read ? 'bg-white/10 text-white/40' : 'bg-orange-500 text-black'}`}>
                                                {msg.subject}
                                            </span>
                                            <span className="text-white/20 text-xs font-mono">
                                                {new Date(msg.created_at).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold flex items-center gap-2">
                                                {msg.name} <span className="text-white/20 font-normal text-sm">— {msg.email}</span>
                                            </h3>
                                            {msg.phone && <p className="text-white/40 text-sm mt-1">📞 {msg.phone}</p>}
                                        </div>
                                        <p className="text-white/70 leading-relaxed font-body whitespace-pre-line bg-white/5 p-4 rounded-2xl italic">
                                            "{msg.message}"
                                        </p>
                                    </div>
                                    <div className="flex md:flex-col gap-3 shrink-0">
                                        <button 
                                            onClick={() => handleToggleRead(msg)} 
                                            title={msg.is_read ? "Mark as unread" : "Mark as read"}
                                            className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${msg.is_read ? 'bg-white/5 text-white/40 hover:bg-white/10' : 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20'}`}
                                        >
                                            {msg.is_read ? <MessageSquare className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                                        </button>
                                        <button 
                                            onClick={() => handleDeleteMessage(msg.id)} 
                                            title="Delete message"
                                            className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500/20 transition-all"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : activeTab === "stores" ? (
                    stores.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-white/30 uppercase tracking-widest text-sm">
                            No stores yet. Add one above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {stores.map(store => (
                                <div key={store.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/20 transition-colors shadow-lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{store.name}</h3>
                                                <p className="text-white/40 text-sm">{store.city}, {store.province}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleEditStore(store)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                <Pencil className="w-4 h-4 text-white/60" />
                                            </button>
                                            <button onClick={() => handleDeleteStore(store.id)} className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-white/50 text-sm">{store.address}</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {(store.flavors ?? []).map((f: string) => (
                                            <span key={f} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black" style={{ backgroundColor: FLAVOR_COLORS[f] ?? '#666' }}>
                                                {f}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    events.length === 0 ? (
                        <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-white/30 uppercase tracking-widest text-sm">
                            No events yet. Add one above!
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {events.map(event => (
                                <div key={event.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/20 transition-colors shadow-lg">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                                                <Calendar className="w-4 h-4 text-orange-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-white leading-tight">{event.name}</h3>
                                                <p className="text-white/40 text-sm">{event.date} {event.year}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                            <button onClick={() => handleEditEvent(event)} className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                                <Pencil className="w-4 h-4 text-white/60" />
                                            </button>
                                            <button onClick={() => handleDeleteEvent(event.id)} className="w-9 h-9 rounded-xl bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="text-white/50 text-sm flex items-center gap-2">
                                        <MapPin className="w-3 h-3" /> {event.location}
                                    </p>
                                    <div className="flex gap-2 items-center">
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black" style={{ backgroundColor: FLAVOR_COLORS[event.flavor] ?? '#666' }}>
                                            {event.flavor}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
