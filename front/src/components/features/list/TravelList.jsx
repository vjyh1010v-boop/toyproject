import { Edit3, Trash2, Calendar } from "lucide-react";
import Button from "../../ui/Button";
import "./TravelList.css";

export default function TravelList({
  entries,
  activeEntryId, // 💡 1. 현재 어떤 카드가 선택되었는지 알기 위해 추가
  setActiveEntryId,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="entries-list">
      {entries.map((entry) => {
        // 💡 2. 데이터 유연성을 위해 id를 문자열로 통일해서 비교합니다.
        const isActive = String(entry.id) === String(activeEntryId);

        return (
          <div
            key={entry.id}
            // 💡 3. isActive가 true일 때 active 클래스를 동적으로 붙여줍니다.
            className={`entry-card ${isActive ? "active" : ""}`}
            onClick={() => setActiveEntryId(entry.id)}
          >
            <div className="entry-card-meta">
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Calendar size={12} />
                {entry.date || entry.travelDate}
              </span>
            </div>

            <h3 className="entry-card-title">{entry.title}</h3>

            <div className="entry-actions">
              <Button variant="secondary" onClick={(e) => handleEdit(entry, e)}>
                <Edit3 size={14} />
              </Button>

              <Button
                variant="danger"
                onClick={(e) => handleDelete(entry.id, e)}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
