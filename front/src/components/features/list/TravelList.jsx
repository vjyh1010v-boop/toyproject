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
            style={{ overflow: "hidden" }} // 📍 사진의 테두리 둥글기를 카드가 깎아주도록 상속
          >
            {/* 📍 [핵심 추가] 업로드된 이미지가 존재하면 카드 최상단에 고정 비율 썸네일 렌더링 */}
            {entry.imageUrl && (
              <div
                className="entry-card-thumbnail"
                style={{
                  width: "100%",
                  height: "140px", // 💡 카드의 답답함을 없애고 사진을 돋보이게 하는 황금 비율
                  overflow: "hidden",
                  borderBottom:
                    "1px solid var(--border-color, rgba(255,255,255,0.05))",
                  marginBottom: "0.75rem",
                }}
              >
                <img
                  src={`http://210.119.14.73:8080${entry.imageUrl}`}
                  alt={entry.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover", // 📍 원본 비율 유지하며 꽉 차게 조절
                    display: "block",
                  }}
                  // 이미지 에러(네트워크 단절 등) 발생 시 엑박 대신 썸네일 영역 전체 숨김 처리
                  onError={(e) => {
                    e.target.parentElement.style.display = "none";
                  }}
                />
              </div>
            )}

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
