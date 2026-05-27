import { Edit3, Trash2, Calendar } from "lucide-react";
import Button from "../../ui/Button";
import "./TravelList.css";

export default function TravelList({
  entries,
  activeEntryId,
  setActiveEntryId,
  handleEdit,
  handleDelete,
}) {
  return (
    <div className="entries-list">
      {entries.map((entry) => {
        const isActive = String(entry.id) === String(activeEntryId);

        return (
          <div
            key={entry.id}
            className={`entry-card ${isActive ? "active" : ""}`}
            onClick={() => setActiveEntryId(entry.id)}
          >
            {/* 💡 불필요한 감싸개 div를 제거하여 레이아웃 흐름을 일원화했습니다. */}
            <div className="entry-card-meta">
              <span
                style={{ display: "flex", alignItems: "center", gap: "4px" }}
              >
                <Calendar size={12} />
                {entry.date || entry.travelDate}
              </span>
            </div>

            <h3 className="entry-card-title">{entry.title}</h3>

            {/* 🚀 2. AI 요약 및 태그 박스 */}
            {entry.aiSummary && (
              <div className="entry-card-ai-summary">
                <div className="ai-summary-text">
                  <span className="ai-summary-sparkle">✨ AI 요약:</span>
                  {entry.aiSummary}
                </div>

                {/* 태그 리스트 */}
                {entry.tags && entry.tags.length > 0 && (
                  <div className="entry-card-tags">
                    {entry.tags.map((tag, index) => (
                      <span key={index} className="entry-tag-item">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 🚀 3. 하단 수정/삭제 버튼 */}
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
