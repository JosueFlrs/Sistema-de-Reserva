import React, { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export function Map({ initialViewState, className, children }) {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const [loaded, setLoaded] = useState(false);

    // Coordenadas por defecto (Mendoza)
    const lng = initialViewState?.longitude || -68.863602;
    const lat = initialViewState?.latitude || -32.852303;
    const zoom = initialViewState?.zoom || 12;

    // --- 1. DEFINIMOS LOS DOS ESTILOS ---
    const DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
    const LIGHT_STYLE = 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json';

    useEffect(() => {
        if (map.current) return;

        // Detectamos el tema inicial al cargar la página
        const isDark = document.documentElement.classList.contains('dark');

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            center: [lng, lat],
            zoom: zoom,
            style: isDark ? DARK_STYLE : LIGHT_STYLE, // Estilo inicial dinámico
            attributionControl: false
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        map.current.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');

        // Marcador rojo
        new maplibregl.Marker({ color: '#FF4444' })
            .setLngLat([lng, lat])
            .addTo(map.current);

        map.current.on('load', () => {
            setLoaded(true);
            map.current.resize();
        });
    }, [lng, lat, zoom]);

    useEffect(() => {
        if (!map.current) return;

        const updateMapStyle = () => {
            const isDark = document.documentElement.classList.contains('dark');
            const newStyle = isDark ? DARK_STYLE : LIGHT_STYLE;
            
            // Le decimos al mapa que cambie su "piel"
            map.current.setStyle(newStyle);
        };

        // Creamos un observador que vigila si cambia la clase 'class' en el <html>
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'class') {
                    updateMapStyle();
                }
            });
        });

        // Empezamos a observar
        observer.observe(document.documentElement, { attributes: true });

        // Limpieza al salir
        return () => observer.disconnect();
    }, []); // Se ejecuta una vez al montar para dejar el espía listo

    return (
        // Fondo dinámico (bg-gray-100 o bg-slate-900) para que no parpadee blanco al cambiar
        <div className={`relative ${className} overflow-hidden rounded-xl bg-gray-100 dark:bg-slate-900 transition-colors duration-300`} style={{ width: '100%', height: '100%' }}>
            <div ref={mapContainer} className="absolute inset-0 w-full h-full" />

            {!loaded && (
                <div className="absolute inset-0 bg-gray-100 dark:bg-slate-900 animate-pulse flex items-center justify-center text-gray-400 dark:text-slate-500 text-sm">
                    Cargando mapa...
                </div>
            )}
            {loaded && children}
        </div>
    );
}