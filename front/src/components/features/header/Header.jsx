import { Compass, Sun, Moon, Info } from "lucide-react";

import "./Header.css";
import Button from "../../ui/Button";

export default function Header({ theme, setTheme }) {
  return (
    <header className="app-header">
      <div className="logo-section">
        <Compass className="logo-icon" size={32} />
        <h1>나의 여행 발자취</h1>
      </div>

      <div className="header-actions">
        <Button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
          {theme === "dark" ? <Sun /> : <Moon />}
        </Button>
      </div>
    </header>
  );
}
