import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import Button from "../../ui/Button"; // 경로 확인 필요
import { Layers, RefreshCcw } from "lucide-react";

import "./TravelMap.css";

export default function TravelMap({
  entries,
  mapCenter,
  mapZoom,
  theme,
  getCustomMarkerIcon, // App.jsx에서 이미 잘 넘겨주고 있는 함수!
  setActiveEntryId,
  MapClickHandler,
  MapViewUpdater,
}) {
  return (
    <div className="map-wrapper">
      {/* UI Controls */}
      <div className="map-controls">
        <Button variant="secondary" onClick={() => setActiveEntryId(null)}>
          <RefreshCcw size={14} />
          Reset
        </Button>

        <Button variant="secondary" onClick={() => console.log("fit bounds")}>
          <Layers size={14} />
          Fit
        </Button>
      </div>

      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          }
        />

        <MapViewUpdater center={mapCenter} zoom={mapZoom} />
        <MapClickHandler />

        {entries
          .filter((e) => e.latitude != null && e.longitude != null)
          .map((e) => (
            <Marker
              key={e.id}
              position={[e.latitude, e.longitude]}
              /* 💡 바로 이 부분에 커스텀 아이콘 함수를 연결해 줍니다! */
              icon={getCustomMarkerIcon ? getCustomMarkerIcon(e) : undefined}
              eventHandlers={{
                click: () => setActiveEntryId(e.id),
              }}
            >
              <Popup>
                <div className="map-popup-card">
                  <h4>{e.title}</h4>
                  <p>{e.locationName}</p>
                </div>
              </Popup>
            </Marker>
          ))}
      </MapContainer>
    </div>
  );
}
