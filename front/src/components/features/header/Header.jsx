import { Compass, Sun, Moon, Info } from "lucide-react";

import "./Header.css";
import Button from "../../ui/Button";

export default function AppHeader({
  theme,
  setTheme,
  setShowICloudModal,
  isCloudSynced,
}) {
  return (
    <header className="app-header">
      <div className="logo-section">
        <Compass className="logo-icon" size={32} />
        <h1>나의 여행 발자취</h1>
      </div>

      <div className="header-actions">
        <div
          className={`icloud-badge ${isCloudSynced ? "synced" : ""}`}
          onClick={() => setShowICloudModal(true)}
        >
          iCloud
          <Info size={14} />
        </div>

        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
