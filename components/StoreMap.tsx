"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

const customIcon = new L.DivIcon({
    className: "custom-leaflet-pin",
    html: `<div style="background-color: var(--accent); width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
});

const userIcon = new L.DivIcon({
    className: "custom-leaflet-user-pin",
    html: `<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

function MapEffect({ stores, userLocation }: { stores: any[], userLocation?: { lat: number, lng: number } | null }) {
    const map = useMap();
    useEffect(() => {
        const validStores = stores.filter(s => s.lat !== undefined && s.lng !== undefined);
        const points: L.LatLngExpression[] = validStores.map(s => [s.lat, s.lng]);

        if (userLocation) {
            points.push([userLocation.lat, userLocation.lng]);
        }

        if (points.length > 0) {
            const bounds = L.latLngBounds(points);
            map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 14, duration: 1.5 });
        }
    }, [stores, userLocation, map]);
    return null;
}

export default function StoreMap({ stores, userLocation }: { stores: any[], userLocation?: { lat: number, lng: number } | null }) {
    return (
        <MapContainer
            center={[56.1304, -106.3468]}
            zoom={3}
            style={{ height: "100%", width: "100%", borderRadius: "1.5rem" }}
            className="z-0"
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />
            <MapEffect stores={stores} userLocation={userLocation} />

            {userLocation && (
                <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                    <Popup className="custom-popup">
                        <div className="font-sans">
                            <h3 className="font-bold text-lg m-0 text-black">You are here</h3>
                        </div>
                    </Popup>
                </Marker>
            )}

            {stores.filter(s => s.lat !== undefined && s.lng !== undefined).map(store => (
                <Marker key={store.id} position={[store.lat, store.lng]} icon={customIcon}>
                    <Popup className="custom-popup">
                        <div className="font-sans">
                            <h3 className="font-bold text-lg m-0 text-black">{store.name}</h3>
                            <p className="m-0 text-gray-700">{store.address}</p>
                            <p className="m-0 text-gray-500 text-sm">{store.city}, {store.province}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
}
