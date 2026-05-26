import { Compass, Sun, Moon, Info } from "lucide-react";

import "./Header.css";
import Button from "../../ui/Button";

export default function Header({ theme, setTheme, user, onAuthClick, onLogout }) {
  return (
    <header className="app-header">
      <div className="logo-section">
        <Compass className="logo-icon" size={32} />
        <h1 className="app-title">나의 여행 발자취</h1>
      </div>

      <div className="header-actions">
        {user ? (
          <div className="user-profile-section" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span className="user-greeting" style={{ fontSize: "14px", fontWeight: "600" }}>
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
          {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
        </Button>
      </div>
    </header>
  );
}
