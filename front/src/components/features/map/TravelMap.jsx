import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import Button from "../../ui/Button";
import { Layers, RefreshCcw } from "lucide-react";

import "./TravelMap.css";

function ActualMapUpdater({ activeEntryId, entries, activeTab }) {
  const map = useMap();

  // 1. 탭 전환 시 강제로 지도 크기 재계산 (화면 로딩/전환 이슈 해결)
  useEffect(() => {
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
  activeTab = "map",
}) {
  const validCenter =
    Array.isArray(mapCenter) &&
    mapCenter.length === 2 &&
    !isNaN(parseFloat(mapCenter[0])) &&
    !isNaN(parseFloat(mapCenter[1]))
      ? [parseFloat(mapCenter[0]), parseFloat(mapCenter[1])]
      : [37.5665, 126.978];

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
                <MarkerPopup entry={e} />{" "}
                {/* 💡 가독성을 위해 팝업 컴포넌트 분리 */}
              </Marker>
            );
          })}
      </MapContainer>
    </div>
  );
}

// 📍 [추가] 팝업 내부 이미지 바인딩 및 엑박 방어 전용 컴포넌트
function MarkerPopup({ entry }) {
  return (
    <Popup>
      <div
        className="map-popup-card"
        style={{ width: "200px", padding: "2px" }}
      >
        {/* 📸 이미지가 있을 경우에만 팝업 제일 상단에 렌더링 */}
        {entry.imageUrl && (
          <div
            style={{
              width: "100%",
              height: "110px",
              marginBottom: "8px",
              overflow: "hidden",
              borderRadius: "4px",
            }}
          >
            <img
              src={`http://210.119.14.73:8080${entry.imageUrl}`}
              alt={entry.title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
              // 혹시 서버 에러 등으로 이미지가 깨지면 투명하게 숨기는 안전 처리
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
        <h4 style={{ margin: "0 0 4px 0", fontSize: "0.95rem" }}>
          {entry.title}
        </h4>
        <p
          style={{
            margin: "0 0 4px 0",
            fontSize: "0.85rem",
            color: "var(--text-secondary)",
          }}
        >
          {entry.locationName}
        </p>

        {/* 만약 AI 요약 텍스트 필드가 있다면 함께 보여줍니다 */}
        {entry.aiSummary && (
          <p
            style={{
              margin: "4px 0 0 0",
              fontSize: "0.75rem",
              color: "#8b5cf6",
              lineHeight: "1.3",
            }}
          >
            ✨ {entry.aiSummary}
          </p>
        )}
      </div>
    </Popup>
  );
}
