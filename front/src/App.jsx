import React, { useState, useRef, useEffect } from "react";

import Header from "./components/features/header/Header";
import TravelForm from "./components/features/form/TravelForm";
import TravelList from "./components/features/list/TravelList";
import TravelMap from "./components/features/map/TravelMap";
import TravelAiChat from "./components/features/chat/TravelAiChat"; 
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
    customTags: "",
  });

  const [exifStatus, setExifStatus] = useState({ type: "", message: "" });
  const fileInputRef = useRef(null);
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
    if (user && user.username) {
      localStorage.setItem("username", user.username);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("user");
    localStorage.removeItem("username"); 
    alert("로그아웃되었습니다.");
    window.location.reload(); 
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const fetchTravels = async () => {
    if (localStorage.getItem("username")) {
      const data = await getTravels();
      setEntries(data);
    }
  };

  useEffect(() => {
    fetchTravels();
  }, [currentUser]); 

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
      // 기존 배열(List)로 저장되어 있던 태그들을 콤마로 연결된 하나의 문자열로 풀어 인풋창에 넣어줍니다!
      customTags: entry.tags ? entry.tags.join(", ") : "",
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

    // 🌟 3. 사용자가 쉼표로 분리해서 적은 태그 문자열을 잘라내어 배열로 만듭니다.
    const userTags = formData.customTags
      ? formData.customTags.split(",").map(tag => tag.trim()).filter(tag => tag !== "")
      : [];

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
      useAi: isAiEnabled,
      tags: userTags // 👈 🌟 쪼개진 태그 배열을 페이로드에 탑재하여 서버로 배달합니다!
    };

    try {
      if (isEditingId) {
        await updateTravel(isEditingId, payload);
      } else {
        await createTravel(payload);
      }

      setIsAddingNew(false);
      setIsEditingId(null);

      // 🌟 추가 센스: 다음 글 작성을 위해 폼 데이터 속의 customTags도 깨끗하게 청소해 줍니다.
      setFormData(prev => ({ ...prev, customTags: "" }));
      await fetchTravels();
    } catch (error) {
      console.error("발자취 저장 중 오류 발생:", error);
      alert("저장에 실패했습니다. AI 로컬 서버 상태를 확인해 주세요.");
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
    <div className="app-container" style={{ position: "relative", minHeight: "100vh" }}>
      {/* 🟢 상단 헤더: 비로그인 상태여도 늘 선명하게 고정 노출 */}
      <Header
        theme={theme}
        setTheme={setTheme}
        user={currentUser}
        onAuthClick={() => setIsSignUpOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
      />

      {/* 🛑 로그인이 안 되어 있을 때만 렌더링되는 블러 가림막 돔(DOM) */}
      {!currentUser && (
        <div style={authGuardStyles.overlay}>
          <div style={authGuardStyles.cardWrapper}>
            <SignUp
              onLoginSuccess={handleLoginSuccess}
              onClose={() => {}} 
            />
          </div>
        </div>
      )}

      {/* 대시보드 구조 내부에 들어있는 팀원분들의 기존 속성(Props) 배달 코드를 온전히 복구했습니다. */}
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

        {/* 2열: 리플릿 지도 영역 */}
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

        {/* 3열: Ollama 대화형 채팅 영역 */}
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

// 💡 반응형(창 크기 조절) 환경에서도 완벽한 블러를 유지하기 위한 스타일 보완
const authGuardStyles = {
  overlay: {
    position: "fixed",
    top: "70px", // Header 상단바 높이만큼 띄움
    left: 0,
    right: 0,
    bottom: 0,
    
    // 💡 [핵심 보완] 창이 작아져 뒤에 컴포넌트가 사라져도, 
    // 가림막 자체에 반투명한 그라데이션 어두운 톤을 깔아주어 언제나 은은한 깊이감을 유지합니다.
    background: "linear-gradient(135deg, rgba(15, 17, 26, 0.75) 0%, rgba(9, 10, 15, 0.85) 100%)",
    
    // 기존의 흐림 효과 유지
    backdropFilter: "blur(14px)",               
    WebkitBackdropFilter: "blur(14px)",
    
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999, 
  },
  cardWrapper: {
    width: "450px",
    maxWidth: "90%",
    padding: "10px",
  }
};

export default App;