import { Compass, Sun, Moon, Map, List, MessageSquare } from "lucide-react"; // 💡 탭용 아이콘 추가

import "./Header.css";
import Button from "../../ui/Button";

export default function Header({
  theme,
  setTheme,
  user,
  onAuthClick,
  onLogout,
  activeTab, // 💡 App.jsx에서 넘겨받을 현재 활성화된 탭 상태
  setActiveTab, // 💡 App.jsx에서 넘겨받을 탭 변경 함수
}) {
  return (
    <header className="app-header">
      {/* 1. 왼쪽: 로고 섹션 */}
      <div className="logo-section">
        <Compass className="logo-icon" size={32} />
        <h1 className="app-title">나의 여행 발자취</h1>
      </div>

      {/* 2. 💡 [추가] 중앙: 탭 네비게이션 영역 */}
      <div className="header-tabs">
        <button
          className={`nav-tab-btn ${activeTab === "list" ? "active" : ""}`}
          onClick={() => setActiveTab("list")}
        >
          <List size={16} />
          <span>발자취 리스트</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === "map" ? "active" : ""}`}
          onClick={() => setActiveTab("map")}
        >
          <Map size={16} />
          <span>지도 보기</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === "chat" ? "active" : ""}`}
          onClick={() => setActiveTab("chat")}
        >
          <MessageSquare size={16} />
          <span>AI 채팅방</span>
        </button>
      </div>

      {/* 3. 오른쪽: 액션 버튼 섹션 */}
      <div className="header-actions">
        {user ? (
          <div
            className="user-profile-section"
            style={{ display: "flex", alignItems: "center", gap: "12px" }}
          >
            <span
              className="user-greeting"
              style={{ fontSize: "14px", fontWeight: "600" }}
            >
              👤 {user.name}님
            </span>
            <Button variant="secondary" size="sm" onClick={onLogout}>
              로그아웃
            </Button>
          </div>
        ) : (
          <Button variant="primary" size="sm" onClick={onAuthClick}>
            로그인
          </Button>
        )}
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Moon size={16} /> : <Sun size={16} />}
        </Button>
      </div>
    </header>
  );
}
