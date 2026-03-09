"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Plus, Trash2, Pencil, X, Check, Lock, Store, Loader2 } from "lucide-react";

const ALL_FLAVORS = ["necto", "cream", "ginger", "pineapple"];

const FLAVOR_COLORS: Record<string, string> = {
    necto: "#f97316",
    cream: "#fde68a",
    ginger: "#ca8a04",
    pineapple: "#84cc16",
};

const emptyForm = {
    name: "",
    address: "",
    city: "",
    province: "",
    lat: "",
    lng: "",
    flavors: [] as string[],
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

    const [stores, setStores] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);
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
        setForm(f => ({
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
        if (authed) fetchStores();
    }, [authed]);

    // Sync addressQuery → form.address when editing
    useEffect(() => {
        setAddressQuery(form.address);
    }, [editingId]); // Only when editingId changes (i.e., a new edit starts)

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

    const notify = (msg: string, isError = false) => {
        if (isError) { setErrorMsg(msg); setTimeout(() => setErrorMsg(""), 3500); }
        else { setSuccessMsg(msg); setTimeout(() => setSuccessMsg(""), 3500); }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        const isEditing = editingId !== null;
        const res = await fetch(isEditing ? `/api/stores/${editingId}` : "/api/stores", {
            method: isEditing ? "PUT" : "POST",
            headers: { "Content-Type": "application/json", "x-admin-secret": secret },
            body: JSON.stringify({
                ...form,
                address: addressQuery || form.address,
                lat: form.lat ? parseFloat(form.lat) : undefined,
                lng: form.lng ? parseFloat(form.lng) : undefined,
            }),
        });

        if (res.ok) {
            notify(isEditing ? "Store updated!" : "Store added!");
            setForm(emptyForm);
            setAddressQuery("");
            setEditingId(null);
            fetchStores();
        } else {
            const data = await res.json();
            notify(data.error || "Something went wrong.", true);
        }
        setSubmitting(false);
    };

    const handleEdit = (store: any) => {
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
        setForm(f);
        setAddressQuery(store.address);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Delete this store?")) return;
        const res = await fetch(`/api/stores/${id}`, { method: "DELETE", headers: { "x-admin-secret": secret } });
        if (res.ok) { notify("Store deleted."); fetchStores(); }
        else notify("Failed to delete.", true);
    };

    const toggleFlavor = (flavor: string) => {
        setForm(f => ({
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
        <div className="min-h-screen bg-[#0a0a0a] text-white pt-10 pb-24">
            <div className="max-w-5xl mx-auto px-6 md:px-12">

                {/* Header */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center">
                        <Store className="w-6 h-6 text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Store Locations</h1>
                        <p className="text-white/40 text-sm mt-0.5">Add, edit, or remove retail store locations</p>
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

                {/* Add / Edit Form */}
                <div className="bg-[#111] border border-white/10 rounded-3xl p-8 mb-12">
                    <h2 className="text-lg font-bold tracking-widest uppercase mb-6 text-white/80">
                        {editingId !== null ? `Editing Store #${editingId}` : "Add New Store"}
                    </h2>

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">

                        {/* Store Name */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Store Name *</label>
                            <input
                                type="text"
                                placeholder="e.g. Fresh Market Toronto"
                                value={form.name}
                                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                                required
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                            />
                        </div>

                        {/* Street Address — with Autocomplete */}
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
                                    setForm(f => ({ ...f, address: e.target.value }));
                                    setShowSuggestions(true);
                                }}
                                onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                                required
                                autoComplete="off"
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                            />

                            {/* Dropdown suggestions */}
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
                                    <p className="px-4 py-2 text-[10px] text-white/20 text-right">© OpenStreetMap contributors</p>
                                </div>
                            )}
                        </div>

                        {/* City */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">City *</label>
                            <input
                                type="text"
                                placeholder="Auto-filled from address"
                                value={form.city}
                                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                required
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                            />
                        </div>

                        {/* Province */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Province *</label>
                            <input
                                type="text"
                                placeholder="Auto-filled from address"
                                value={form.province}
                                onChange={e => setForm(f => ({ ...f, province: e.target.value }))}
                                required
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm"
                            />
                        </div>

                        {/* Lat / Lng (auto-filled, but editable) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Latitude <span className="text-white/20 normal-case font-normal">(auto-filled)</span></label>
                            <input
                                type="text"
                                placeholder="e.g. 43.651070"
                                value={form.lat}
                                onChange={e => setForm(f => ({ ...f, lat: e.target.value }))}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm font-mono"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Longitude <span className="text-white/20 normal-case font-normal">(auto-filled)</span></label>
                            <input
                                type="text"
                                placeholder="e.g. -79.387015"
                                value={form.lng}
                                onChange={e => setForm(f => ({ ...f, lng: e.target.value }))}
                                className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-400 transition-colors text-sm font-mono"
                            />
                        </div>

                        {/* Flavors */}
                        <div className="md:col-span-2 flex flex-col gap-2">
                            <label className="text-xs font-bold uppercase tracking-widest text-white/40">Flavors Available</label>
                            <div className="flex gap-3 flex-wrap">
                                {ALL_FLAVORS.map(f => (
                                    <button
                                        key={f}
                                        type="button"
                                        onClick={() => toggleFlavor(f)}
                                        className={`px-4 py-2 rounded-full text-sm font-bold tracking-widest uppercase border transition-all ${form.flavors.includes(f) ? 'border-transparent text-black' : 'border-white/10 text-white/40 hover:border-white/30'}`}
                                        style={form.flavors.includes(f) ? { backgroundColor: FLAVOR_COLORS[f] } : {}}
                                    >
                                        {f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="md:col-span-2 flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex items-center gap-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-3 px-8 rounded-xl tracking-widest uppercase transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                {submitting ? "Saving..." : editingId !== null ? "Update Store" : "Add Store"}
                            </button>
                            {editingId !== null && (
                                <button
                                    type="button"
                                    onClick={() => { setEditingId(null); setForm(emptyForm); setAddressQuery(""); }}
                                    className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 font-bold py-3 px-6 rounded-xl tracking-widest uppercase transition-colors"
                                >
                                    <X className="w-4 h-4" /> Cancel
                                </button>
                            )}
                        </div>
                    </form>
                </div>

                {/* Store List */}
                <h2 className="text-lg font-bold tracking-widest uppercase mb-6 text-white/80">
                    All Stores ({stores.length})
                </h2>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-40 rounded-2xl bg-white/5 animate-pulse" />)}
                    </div>
                ) : stores.length === 0 ? (
                    <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl text-white/30 uppercase tracking-widest text-sm">
                        No stores yet. Add one above!
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {stores.map(store => (
                            <div key={store.id} className="bg-[#111] border border-white/10 rounded-3xl p-6 flex flex-col gap-4 hover:border-white/20 transition-colors">
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
                                        <button onClick={() => handleEdit(store)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                                            <Pencil className="w-3.5 h-3.5 text-white/60" />
                                        </button>
                                        <button onClick={() => handleDelete(store.id)} className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                                        </button>
                                    </div>
                                </div>

                                <p className="text-white/50 text-sm">{store.address}</p>

                                {store.lat && (
                                    <p className="text-white/30 text-xs font-mono">{store.lat}, {store.lng}</p>
                                )}

                                <div className="flex gap-2 flex-wrap">
                                    {(store.flavors ?? []).map((f: string) => (
                                        <span key={f} className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-black" style={{ backgroundColor: FLAVOR_COLORS[f] ?? '#666' }}>
                                            {f}
                                        </span>
                                    ))}
                                    {store.flavors?.length === 0 && <span className="text-xs text-white/20">No flavors selected</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
