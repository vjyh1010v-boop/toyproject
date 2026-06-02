import React, { useState, useRef, useEffect } from "react";

import Header from "./components/features/header/Header";
import TravelForm from "./components/features/form/TravelForm";
import TravelList from "./components/features/list/TravelList";
import TravelMap from "./components/features/map/TravelMap";
import TravelAiChat from "./components/features/chat/TravelAiChat"; // 💡 2단계에서 만든 AI 채팅 컴포넌트 임포트
import SignUp from "./components/features/auth/SignUp";
import Modal from "./components/ui/Modal";

import { useMapEvents } from "react-leaflet";
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

// 💡 MapClickHandler는 App 컴포넌트 바깥 영역에 두어 최적화 상태를 유지합니다.
const MapClickHandler = ({
  isEditingId,
  setIsEditingId,
  setFormData,
  setIsAddingNew,
}) => {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      console.log(`🎯 지도 클릭됨: 위도 ${lat}, 경도 ${lng}`);

      if (isEditingId) {
        if (
          !window.confirm(
            "현재 수정 중인 내용이 있습니다. 신규 등록으로 전환할까요?",
          )
        ) {
          return;
        }
        setIsEditingId(null);
      }

      setFormData((prev) => ({
        ...prev,
        lat: lat.toFixed(6),
        lng: lng.toFixed(6),
        locationName: "",
      }));

      setIsAddingNew(true);
    },
  });
  return null;
};

function App() {
  const [entries, setEntries] = useState([]);

  const [activeEntryId, setActiveEntryId] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRegion, setFilterRegion] = useState("All");
  const [theme, setTheme] = useState("dark");

  // Authentication State
  const [isSignUpOpen, setIsSignUpOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

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
    useAi: false,
  });

  const [exifStatus, setExifStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);

  // 💡 지도가 들어있는 우측 컬럼을 타겟팅하기 위한 엘리먼트 레퍼런스 선언
  const mapColumnRef = useRef(null);

  // 로컬 스토리지에서 기존 로그인된 사용자 정보 가져오기
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    localStorage.setItem("user", JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    alert("로그아웃되었습니다.");
  };

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

  // 💡 리스트 카드를 클릭하여 activeEntryId가 유효하게 바뀔 때, 화면이 좁은 상태라면 지도로 자동 스크롤
  useEffect(() => {
    if (window.innerWidth <= 1200 && activeEntryId && mapColumnRef.current) {
      mapColumnRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [activeEntryId]);

  const handleEdit = (entry, e) => {
    e.stopPropagation();

    setFormData({
      title: entry.title,
      locationName: entry.locationName,
      date: entry.date,
      content: entry.content,
      lat: (entry.lat || entry.latitude || "").toString(),
      lng: (entry.lng || entry.longitude || "").toString(),
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

  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const isAiEnabled = formData.useAi;
    setIsAiLoading(true);

    // 📍 1. 기존 객체 페이로드를 스프링 DTO 구조에 맞게 생성
    const payload = {
      title: formData.title,
      locationName: formData.locationName,
      travelDate: formData.date,
      content: formData.content,
      latitude: parseFloat(formData.lat),
      longitude: parseFloat(formData.lng),
      visits: parseInt(formData.visits) || 1,
      imageUrl: formData.image, // 기존 이미지 경로 또는 빈 문자열
      region: formData.region,
      useAi: isAiEnabled,
    };

    // 📍 2. 멀티파트 전송용 FormData 객체 조립
    const transferData = new FormData();

    // 스프링의 @RequestPart("request") 명칭에 대응 (JSON 블롭 처리 필수)
    transferData.append(
      "request",
      new Blob([JSON.stringify(payload)], { type: "application/json" }),
    );

    // 사용자가 폼에서 새로 선택한 파일 객체(imageFile)가 있다면 폼데이터에 실어 보냄
    // 스프링의 @RequestPart(value = "file", required = false) 명칭에 대응
    if (formData.imageFile) {
      transferData.append("file", formData.imageFile);
    }

    try {
      if (isEditingId) {
        // 💡 수정 모드 호출 (travelApi가 내부적으로 axios.put을 수행하도록 호환 세팅)
        await updateTravel(isEditingId, transferData);
      } else {
        // 💡 신규 등록 모드 호출
        await createTravel(transferData);
      }

      // 초기화 작업
      setIsAddingNew(false);
      setIsEditingId(null);

      // 📍 등록 성공 후 폼데이터 상태 원복 시 새로 만든 imageFile 필드도 함께 깔끔히 청소
      setFormData({
        title: "",
        locationName: "",
        date: new Date().toISOString().split("T")[0],
        content: "",
        lat: "",
        lng: "",
        visits: 1,
        image: "",
        imageFile: null, // 👈 추가
        region: "서울",
        useAi: false,
      });

      // 강제 파일 인풋 창 비우기
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      await fetchTravels();
    } catch (error) {
      console.error("발자취 저장 중 오류 발생:", error);
      alert(
        "저장에 실패했습니다. 로컬 서버 및 파일 네트워크 상태를 확인해 주세요.",
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const getCustomMarkerIcon = (entry) => {
    return L.divIcon({
      className: "custom-travel-marker",
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
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    });
  };

  const [activeTab, setActiveTab] = useState("list");

  return (
    <div className="app-container">
      <Header
        theme={theme}
        setTheme={setTheme}
        user={currentUser}
        onAuthClick={() => setIsSignUpOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab} // 👈 추가
        setActiveTab={setActiveTab} // 👈 추가
      />

      <div className={`dashboard-grid view-${activeTab}`}>
        {/* 1열: 발자취 리스트 영역 */}
        <div className="left-column">
          <TravelList
            entries={entries}
            activeEntryId={activeEntryId}
            setActiveEntryId={setActiveEntryId}
            handleEdit={handleEdit}
            handleDelete={handleDelete}
          />
        </div>

        {/* 2열: 리플릿 지도 영역 (ref 연결) */}
        <div className="right-column" ref={mapColumnRef}>
          <TravelMap
            entries={entries}
            mapCenter={[37.5665, 126.978]}
            mapZoom={13}
            theme={theme}
            activeEntryId={activeEntryId}
            setActiveEntryId={setActiveEntryId}
            getCustomMarkerIcon={getCustomMarkerIcon}
            activeTab={activeTab}
            MapClickHandler={() => (
              <MapClickHandler
                isEditingId={isEditingId}
                setIsEditingId={setIsEditingId}
                setFormData={setFormData}
                setIsAddingNew={setIsAddingNew}
              />
            )}
          />
        </div>

        {/* 3열: Ollama 대화형 채팅 영역 추가 */}
        <div className="chat-column">
          <TravelAiChat />
        </div>
      </div>

      <Modal
        open={isAddingNew || !!isEditingId}
        title={isEditingId ? "발자취 수정하기" : "새 발자취 추가"}
        onClose={() => {
          if (!isAiLoading) {
            setIsAddingNew(false);
            setIsEditingId(null);
          }
        }}
      >
        <TravelForm
          formData={formData}
          setFormData={setFormData}
          isEditingId={isEditingId}
          setIsAddingNew={setIsAddingNew}
          setIsEditingId={setIsEditingId}
          handleSubmit={handleFormSubmit}
          fileInputRef={fileInputRef}
          exifStatus={exifStatus}
          isAiLoading={isAiLoading}
        />
      </Modal>

      <Modal
        open={isSignUpOpen}
        title="로그인 및 회원가입"
        onClose={() => setIsSignUpOpen(false)}
      >
        <SignUp
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsSignUpOpen(false)}
        />
      </Modal>
    </div>
  );
}

export default App;
