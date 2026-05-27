import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Button from "../../ui/Button";
import { Layers, RefreshCcw } from "lucide-react";

import "./TravelMap.css";

// 지도를 움직여주는 진짜 컴포넌트
// src/components/features/map/TravelMap.jsx

function ActualMapUpdater({ activeEntryId, entries, activeTab }) {
  const map = useMap();

  useEffect(() => {
    // 💡 변경: activeTab이 무엇이든 상관없이 움직이도록 방어 로직 제거!
    if (!activeEntryId || !entries || entries.length === 0) return;

    const currentEntry = entries.find(
      (entry) => String(entry.id) === String(activeEntryId),
    );

    if (currentEntry) {
      const rawLat = currentEntry.latitude || currentEntry.lat;
      const rawLng = currentEntry.longitude || currentEntry.lng;
      const lat = parseFloat(rawLat);
      const lng = parseFloat(rawLng);

      if (!isNaN(lat) && !isNaN(lng)) {
        // 💡 화면 밖이어도 좌표 이동은 수행됨
        map.invalidateSize();

        const timer = setTimeout(() => {
          try {
            // 💡 여기 있던 if (activeTab === "map") 조건문을 제거합니다.
            // 그러면 화면이 보이든 안 보이든 무조건 좌표로 이동합니다.
            map.flyTo([lat, lng], 14, {
              animate: true,
              duration: 1.5,
            });
          } catch (error) {
            console.error("Leaflet flyTo 에러 방어:", error);
          }
        }, 100);

        return () => clearTimeout(timer);
      }
    }
  }, [activeEntryId, entries, map]); // 💡 activeTab도 의존성 배열에서 빼도 무방합니다.

  return null;
}

export default function TravelMap({
  entries,
  mapCenter,
  mapZoom,
  theme,
  getCustomMarkerIcon,
  setActiveEntryId,
  MapClickHandler,
  activeEntryId,
  activeTab = "map", // 기본값 설정으로 PC 버전도 문제없게 대응
}) {
  // 💡 핵심 방어선 2: 부모(App.jsx)로부터 넘어온 mapCenter가 유효한지 최종 검증합니다.
  // 만약 NaN이 섞여 들어오거나 올바른 배열이 아니면 서울 중심점 등의 안전한 기본값으로 강제 강제 전환합니다.
  const validCenter =
    Array.isArray(mapCenter) &&
    mapCenter.length === 2 &&
    !isNaN(parseFloat(mapCenter[0])) &&
    !isNaN(parseFloat(mapCenter[1]))
      ? [parseFloat(mapCenter[0]), parseFloat(mapCenter[1])]
      : [37.5665, 126.978]; // 안전망 기본 좌표 (서울)

  const validZoom = isNaN(parseInt(mapZoom)) ? 13 : parseInt(mapZoom);

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

      {/* 💡 에러 방어 핵심: 유효성이 무조건 검증된 validCenter만 주입합니다. */}
      <MapContainer
        center={validCenter}
        zoom={validZoom}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url={
            theme === "dark"
              ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
              : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png"
          }
        />

        <ActualMapUpdater
          activeEntryId={activeEntryId}
          entries={entries}
          activeTab={activeTab}
        />

        {MapClickHandler && <MapClickHandler />}

        {entries
          .filter((e) => {
            const lat = parseFloat(e.latitude || e.lat);
            const lng = parseFloat(e.longitude || e.lng);
            return !isNaN(lat) && !isNaN(lng);
          })
          .map((e) => {
            const lat = parseFloat(e.latitude || e.lat);
            const lng = parseFloat(e.longitude || e.lng);

            return (
              <Marker
                key={e.id}
                position={[lat, lng]}
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
            );
          })}
      </MapContainer>
    </div>
  );
}
