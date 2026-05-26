import React, { useState, useRef, useEffect } from "react";

import Header from "./components/features/header/Header";
import TravelForm from "./components/features/form/TravelForm";
import TravelList from "./components/features/list/TravelList";
import TravelMap from "./components/features/map/TravelMap";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import {
  getTravels,
  createTravel,
  updateTravel,
  deleteTravel,
} from "./api/travelApi";
import "./styles/global.css";
import "./styles/layout.css";
import "./styles/util.css";

function App() {
  const [entries, setEntries] = useState([]);

  const [activeEntryId, setActiveEntryId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [theme, setTheme] = useState("dark");

  // Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [isEditingId, setIsEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    locationName: "",
    date: new Date().toISOString().split("T")[0],
    content: "",
    lat: "",
    lng: "",
    visits: 1,
    image: "",
    region: "서울",
  });

  const [exifStatus, setExifStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchTravels = async () => {
    const data = await getTravels();
    setEntries(data);
  };

  useEffect(() => {
    fetchTravels();
  }, []);

  const handleEdit = (entry, e) => {
    e.stopPropagation();

    setFormData({
      title: entry.title,
      locationName: entry.locationName,
      date: entry.date,
      content: entry.content,
      lat: entry.lat.toString(),
      lng: entry.lng.toString(),
      visits: entry.visits,
      image: entry.image,
      region: entry.region,
    });

    setIsEditingId(entry.id);
    setIsAddingNew(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();

    if (window.confirm("삭제할까요?")) {
      await deleteTravel(id);
      await fetchTravels();
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      locationName: formData.locationName,
      travelDate: formData.date,
      content: formData.content,
      latitude: parseFloat(formData.lat),
      longitude: parseFloat(formData.lng),
      visits: parseInt(formData.visits) || 1,
      imageUrl: formData.image,
      region: formData.region,
    };

    if (isEditingId) {
      await updateTravel(isEditingId, payload);
    } else {
      await createTravel(payload);
    }

    setIsAddingNew(false);
    setIsEditingId(null);
    await fetchTravels();
  };

  // L.icon 대신 HTML/CSS를 사용할 수 있는 L.divIcon으로 변경합니다.
  const getCustomMarkerIcon = (entry) => {
    // 만약 entry별로 스타일을 다르게 주고 싶다면 entry.visits 등을 활용할 수 있습니다.
    return L.divIcon({
      className: "custom-travel-marker", // CSS에서 제어할 수 있도록 클래스 부여
      html: `
        <div class="marker-pin-wrapper">
          <div class="marker-pulse"></div>
          <div class="marker-core">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-map-pin">
              <path d="M20 10c0 4.993-5.539 10.193-7.399 11.74a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        </div>
      `,
      iconSize: [40, 40], // 마커의 전체 크기 [가로, 세로]
      iconAnchor: [20, 40], // 마커 핀의 꼭짓점이 정확히 좌표를 가리키도록 설정 (가로 절반, 세로 끝)
      popupAnchor: [0, -40], // 팝업창이 마커 바로 위에 예쁘게 뜨도록 설정
    });
  };

  return (
    <div className="app-container">
      <Header theme={theme} setTheme={setTheme} />

      <div className="dashboard-grid">
        <div className="left-column">
          <TravelList
            entries={entries}
            setActiveEntryId={setActiveEntryId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
          {isAddingNew && (
            <TravelForm
              formData={formData}
              setFormData={setFormData}
              isEditingId={isEditingId}
              setIsAddingNew={setIsAddingNew}
              setIsEditingId={setIsEditingId}
              handleSubmit={handleFormSubmit}
              fileInputRef={fileInputRef}
              exifStatus={exifStatus}
            />
          )}
        </div>

        <div className="right-column">
          <TravelMap
            entries={entries}
            mapCenter={[37.5665, 126.978]} // 임시 고정값
            mapZoom={13}
            theme={theme}
            setActiveEntryId={setActiveEntryId}
            getCustomMarkerIcon={getCustomMarkerIcon}
            MapClickHandler={() => null}
            MapViewUpdater={() => null}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
