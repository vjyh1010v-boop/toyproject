import { Edit3, Trash2, Calendar } from "lucide-react";
import Button from "../../ui/Button";
import "./TravelList.css";

export default function TravelList({
  entries,
  setActiveEntryId,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="entries-list">
      {entries.map((entry) => (
        <div
          key={entry.id}
          className="entry-card"
          onClick={() => setActiveEntryId(entry.id)}
        >
          <div className="entry-card-meta">
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={12} />
              {/* API 응답 필드가 travelDate인지 date인지 확인 필요, 우선 기존 코드 유지 */}
              {entry.date || entry.travelDate}
            </span>
          </div>

          <h3 className="entry-card-title">{entry.title}</h3>

          <div className="entry-actions">
            {/* 이벤트 버블링(부모 카드 클릭 방지)을 위해 e.stopPropagation() 유지 */}
            <Button variant="secondary" onClick={(e) => handleEdit(entry, e)}>
              <Edit3 size={14} />
            </Button>

            <Button variant="danger" onClick={(e) => handleDelete(entry.id, e)}>
              <Trash2 size={14} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
