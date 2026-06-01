import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Button from "../../ui/Button";
import { Layers, RefreshCcw } from "lucide-react";

import "./TravelMap.css";

// 지도를 움직여주는 진짜 컴포넌트
// src/components/features/map/TravelMap.jsx

function ActualMapUpdater({ activeEntryId, entries, activeTab }) {
  const map = useMap();

  // 1. 탭 전환 시 강제로 지도 크기 재계산 (화면 로딩/전환 이슈 해결)
  useEffect(() => {
    // 탭이 바뀔 때 지도가 화면에 나타나면, 브라우저가 레이아웃을 잡을 시간을 0.1초 줍니다.
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    return () => clearTimeout(timer);
  }, [activeTab, map]);

  // 2. 기존 좌표 이동 로직
  useEffect(() => {
    if (!activeEntryId || !entries || entries.length === 0) return;

    const currentEntry = entries.find(
      (e) => String(e.id) === String(activeEntryId),
    );
    if (currentEntry) {
      const lat = parseFloat(currentEntry.latitude || currentEntry.lat);
      const lng = parseFloat(currentEntry.longitude || currentEntry.lng);

      if (!isNaN(lat) && !isNaN(lng)) {
        // 이동 전에도 한 번 더 확인
        map.invalidateSize();
        map.flyTo([lat, lng], 14, { animate: true, duration: 1.5 });
      }
    }
  }, [activeEntryId, entries, map]);

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
