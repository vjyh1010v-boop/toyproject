// 💡 1. useEffect와 useMap 임포트 추가!
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Button from "../../ui/Button";
import { Layers, RefreshCcw } from "lucide-react";

import "./TravelMap.css";

// 지도를 움직여주는 진짜 컴포넌트
function ActualMapUpdater({ activeEntryId, entries }) {
  const map = useMap();

  useEffect(() => {
    console.log("현재 선택된 ID:", activeEntryId, typeof activeEntryId);
    console.log("전체 리스트:", entries);

    if (!activeEntryId || !entries || entries.length === 0) {
      console.log("데이터가 없어서 이동 로직을 건너뜁니다.");
      return;
    }

    const currentEntry = entries.find(
      (entry) => String(entry.id) === String(activeEntryId),
    );

    console.log("찾은 여행 기록 데이터:", currentEntry);

    if (currentEntry) {
      // 💡 백엔드 응답 데이터 형식이 e.latitude 인 것을 반영
      const lat = currentEntry.latitude || currentEntry.lat;
      const lng = currentEntry.longitude || currentEntry.lng;

      if (lat && lng) {
        console.log(`🗺️ [${lat}, ${lng}] 좌표로 이동을 시작합니다!`);
        map.flyTo([parseFloat(lat), parseFloat(lng)], 14, {
          animate: true,
          duration: 1.5,
        });
      } else {
        console.log("❌ 해당 데이터에 위도/경도 값이 없습니다!", currentEntry);
      }
    } else {
      console.log("❌ 일치하는 ID의 데이터를 리스트에서 찾지 못했습니다.");
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
  activeEntryId, // 💡 2. App.jsx에서 넘겨받을 ID 추가
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

        {/* 💡 3. 이름을 겹치지 않게 수정한 진짜 컴포넌트로 호출 */}
        <ActualMapUpdater activeEntryId={activeEntryId} entries={entries} />

        {MapClickHandler && <MapClickHandler />}

        {entries
          .filter((e) => e.latitude != null && e.longitude != null)
          .map((e) => (
            <Marker
              key={e.id}
              position={[e.latitude, e.longitude]}
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
