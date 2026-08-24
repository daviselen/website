import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css"
import styles from "./RetailMap.module.css";
import { Checkbox } from "../design-system/components/CheckBox";

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

const MAP_STYLE = "mapbox://styles/jrcorey/cm01hdg0k00aq01rb8o9l6tyx";

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function circleIcon(color, size = 64) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
  return ctx.getImageData(0, 0, size, size);
}

// Assets live under public/. Place the label/number SVGs here.
const ASSETS = "/images/map/";

// Company property key carries a leading U+FEFF BOM in the tileset — kept
// exactly as in the source data or the `match` expressions never hit.
const COMPANY_KEY = "﻿Company";

// Vector sources, added once on map load.
const SOURCES = [
  { id: "custom-tileset", url: "mapbox://jrcorey.0axit608" },
  { id: "custom-tileset-2", url: "mapbox://jrcorey.aj270hag" },
];

// Icon layers, in add order = bottom-to-top stacking (unchanged from source).
const LAYERS = [
  { id: "mcd-icon-layer", source: "custom-tileset", sourceLayer: "DE_Clients-For-Map_2025-757r4i", company: "McDonald's", marker: "McD-Marker", fallback: "#ffbc0d", size: 1, overlap: false },
  { id: "bb-icon-layer", source: "custom-tileset", sourceLayer: "DE_Clients-For-Map_2025-757r4i", company: "Best Buy", marker: "BB-Marker", fallback: "#4976e6", size: 1, overlap: false },
  { id: "sf-icon-layer", source: "custom-tileset", sourceLayer: "DE_Clients-For-Map_2025-757r4i", company: "Smart & Final", marker: "SF-Marker-1", fallback: "#c8102e", size: 0.8, overlap: false },
  { id: "toyota-icon-layer", source: "custom-tileset", sourceLayer: "DE_Clients-For-Map_2025-757r4i", company: "Toyota", marker: "Toyota-Marker", fallback: "#FFFFFF", size: 1.2, overlap: false },
  { id: "DE-icon-layer", source: "custom-tileset-2", sourceLayer: "DE-Agency-Locations-0719o7", company: "Davis Elen", marker: "DE-Marker", fallback: "#a4de02", size: 1, overlap: true },
];

// Header toggles, in display order. `layer` maps each checkbox to its layer.
const TOGGLES = [
  { id: "toy", layer: "toyota-icon-layer", label: "toyota-label.svg", labelAlt: "Toyota", labelId: "toy-svg", number: "Toyota-Number.svg", numberAlt: "76 locations", numberId: "toyota-locations", active: true },
  { id: "mcd", layer: "mcd-icon-layer", label: "mcdonalds-label.svg", labelAlt: "McDonald’s", number: "McD-Number.svg", numberAlt: "2,654 locations", active: true },
  { id: "bb", layer: "bb-icon-layer", label: "best-buy-label.svg", labelAlt: "BestBuy", number: "BestBuy-Number.svg", numberAlt: "1,056 locations", active: true },
  { id: "sf", layer: "sf-icon-layer", label: "smart-and-final-label.svg", labelAlt: "Smart & Final", number: "SF-Number.svg", numberAlt: "254 locations", active: true },
  { id: "de", layer: "DE-icon-layer", label: "de-logo-no-stroke.svg", labelAlt: "Davis Elen", number: "DE-Number.svg", numberAlt: "5 locations", active: true },
];

// Zoom preset buttons.
const ZOOMS = [
  { id: "zoom_us", label: "United States", bounds: [[-125.244141, 24.994541], [-66.665039, 49.525457]] },
  { id: "zoom_socal", label: "Southern California", bounds: [[-117.4945, 34.3934], [-119.289, 33.5937]] },
  { id: "zoom_pnw", label: "Pacific Northwest", bounds: [[-127.199836, 40.865497], [-106.63343, 49.104219]] },
  { id: "zoom_ne", label: "Northeast", bounds: [[-83.699341, 39.122103], [-63.132935, 47.591839]] },
  { id: "zoom_midwest", label: "Mid-West", bounds: [[-104.351149, 33.937557], [-83.784742, 43.05575]] },
];

export default function RetailMap() {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const [toggles, setToggles] = useState(TOGGLES);
  
    useEffect(() => {
      mapboxgl.accessToken = MAPBOX_TOKEN;
  
      const bounds = new mapboxgl.LngLatBounds(
        new mapboxgl.LngLat(-125.244141, 24.994541),
        new mapboxgl.LngLat(-66.665039, 49.525457)
      );
  
      const map = new mapboxgl.Map({
        container: containerRef.current,
        accessToken: MAPBOX_TOKEN,
        style: MAP_STYLE,
        pitch: 0,
        bounds,
      });
      mapRef.current = map;
  
      const popup = new mapboxgl.Popup({
        offset: 15,
        anchor: "bottom",
        closeButton: false,
        closeOnClick: false,
      });
  
      map.scrollZoom.disable();
      map.once("moveend", () => map.scrollZoom.enable());
  
      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
      const geocoder = new MapboxGeocoder({ accessToken: MAPBOX_TOKEN, mapboxgl });
      map.addControl(geocoder, "top-left");
  
      map.on("styleimagemissing", (e) => {
        if (map.hasImage(e.id)) return;
        const layer = LAYERS.find((l) => l.marker === e.id || l.fallback === e.id);
        if (!layer) return;
        map.addImage(e.id, circleIcon(layer.fallback));
      });

      map.on("load", () => {
        SOURCES.forEach((s) => map.addSource(s.id, { type: "vector", url: s.url }));

        LAYERS.forEach((l) => {
          map.addLayer({
            id: l.id,
            type: "symbol",
            source: l.source,
            "source-layer": l.sourceLayer,
            filter: ["==", ["get", COMPANY_KEY], l.company],
            layout: {
              "icon-image": l.marker,
              "icon-size": l.size,
              "icon-allow-overlap": l.overlap,
            },
          });

          map.on("mousemove", l.id, (e) => {
            const feature = e.features?.[0];
            if (!feature) return;

            map.getCanvas().style.cursor = "crosshair";
            const coordinates = feature.geometry.coordinates.slice();
            const companyName = escapeHtml(feature.properties[COMPANY_KEY]);
            const address = escapeHtml(feature.properties["Address"]);

            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            popup
              .setLngLat(coordinates)
              .setHTML(
                `<h3 style="font-size: 16px; line-height: 1; color: #1a1a1a; margin-top: 0.5em; margin-bottom: 0.25em;">${companyName}</h3>` +
                `<p class="text-neutral-0" style="font-size: 11px; line-height: 1.272727; margin-top: 0; margin-bottom: 1em;">${address}</p>`
              )
              .addTo(map);
          });
  
          map.on("mouseleave", l.id, () => {
            map.getCanvas().style.cursor = "";
            popup.remove();
          });
        });
      });
  
      const startBounds = [
        [-118.61422051240453, 33.60833296991132],
        [-117.49723469884276, 34.13001846734977],
      ];
      let flyTimer = null;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              flyTimer = setTimeout(() => {
                map.fitBounds(startBounds, { maxZoom: 9.853842673270805, duration: 5000, speed: 0.5 });
              }, 2000);
              observer.disconnect();
            }
          });
        },
        { threshold: 0.5 }
      );
      observer.observe(containerRef.current);
  
      return () => {
        observer.disconnect();
        if (flyTimer) clearTimeout(flyTimer);
        popup.remove();
        map.remove();
        mapRef.current = null;
      };
    }, []);
  
    const toggleLayer = (layerId, targetLayerKey, visible) => {
      const map = mapRef.current;
      if (map && map.getLayer(targetLayerKey)) {
        map.setLayoutProperty(targetLayerKey, "visibility", visible ? "visible" : "none");
      }
  
      setToggles((prevToggles) =>
        prevToggles.map((t) =>
          t.id === layerId ? { ...t, active: visible } : t
        )
      );
    };
  
    const zoomTo = (bounds) => {
      if (mapRef.current) mapRef.current.fitBounds(bounds);
    };
  
    return (
      <div className={`${styles['map-container']} mx-8`}>
        <div id="menu" className={`${styles.menu} rounded-r-md`}>
          {toggles.map((t) => (
            <div key={t.id} className={`${styles['menu-item']} ${styles[t.id]}`}>
              <Checkbox
                id={t.id}
                checked={t.active}
                onChange={(e) => {
                  const checked = typeof e === "boolean" ? e : e.target.checked;
                  toggleLayer(t.id, t.layer, checked);
                }}
                label={<div className={`${styles['toggle-label']}`}>
                <img className={styles.company} id={t.labelId} src={ASSETS + t.label} alt={t.labelAlt} />
                <span className={`${styles.locations} ${styles[t.numberId]}`} id={t.numberId}>{t.numberAlt}</span>
              </div>}
              />
            </div>
          ))}
        </div>
  
        <div className={`${styles['map-wrap']} rounded-l-md overflow-hidden`}>
          <div id="map" className={`${styles.map}`} ref={containerRef} />
          <div id="zoom" className={styles.zoom}>
            {ZOOMS.map((z) => (
              <button key={z.id} id={z.id} onClick={() => zoomTo(z.bounds)}>
                {z.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }