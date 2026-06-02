import "./TravelForm.css";

export default function TravelForm({
  formData,
  setFormData,
  handleSubmit, // App.jsx의 handleSubmit과 동기화
  isEditingId,
  setIsAddingNew,
  setIsEditingId,
  fileInputRef,
  handlePhotoUpload,
  exifStatus,
  isAiLoading, // 💡 App.jsx에서 넘겨준 AI 로딩 상태 받아오기
}) {
  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <h2
        className="form-group full-width"
        style={{ color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}
      >
        {isEditingId ? "발자취 수정" : "새 발자취 추가"}
      </h2>

      {/* 💡 제목 필드: full-width 클래스를 제거하여 가로 절반만 차지하게 합니다. */}
      <div className="form-group">
        <label className="form-label">제목</label>
        <input
          className="form-input"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="여행의 제목을 입력하세요"
          required
        />
      </div>

      {/* 🌟 [빨간 네모 칸 위치] 나만의 태그 필드 추가! */}
      <div className="form-group">
        <label className="form-label">나만의 태그 (쉼표로 구분)</label>
        <input
          className="form-input"
          value={formData.customTags || ""}
          onChange={(e) => setFormData({ ...formData, customTags: e.target.value })}
          placeholder="예: 서울여행, 맛집, 힐링"
        />
      </div>

      {/* 장소 필드 */}
      <div className="form-group">
        <label className="form-label">장소 명칭</label>
        <input
          className="form-input"
          value={formData.locationName || ""}
          onChange={(e) =>
            setFormData({ ...formData, locationName: e.target.value })
          }
          placeholder="예: 부산 광안리 해수욕장"
        />
      </div>

      {/* 날짜 필드 */}
      <div className="form-group">
        <label className="form-label">날짜</label>
        <input
          type="date"
          className="form-input"
          value={formData.date || ""}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
        />
      </div>

      {/* 위도 필드 */}
      <div className="form-group">
        <label className="form-label">위도 (Latitude)</label>
        <input
          type="number"
          step="any"
          className="form-input"
          value={formData.lat || ""}
          onChange={(e) => setFormData({ ...formData, lat: e.target.value })}
          placeholder="37.5665"
          required
        />
      </div>

      {/* 경도 필드 */}
      <div className="form-group">
        <label className="form-label">경도 (Longitude)</label>
        <input
          type="number"
          step="any"
          className="form-input"
          value={formData.lng || ""}
          onChange={(e) => setFormData({ ...formData, lng: e.target.value })}
          placeholder="126.978"
          required
        />
      </div>

      {/* 여행 내용 필드 */}
      <div className="form-group full-width">
        <label className="form-label">추억 기록</label>
        <textarea
          className="form-textarea"
          value={formData.content || ""}
          onChange={(e) =>
            setFormData({ ...formData, content: e.target.value })
          }
          placeholder="그곳에서 어떤 재미있는 일이 있으셨나요?"
        />
      </div>

      {/* 💡 [추가] AI 토글 체크박스 */}
      <div
        className="ai-toggle-group"
        style={{
          marginTop: "10px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="checkbox"
          id="useAi"
          checked={formData.useAi || false}
          onChange={(e) =>
            setFormData({ ...formData, useAi: e.target.checked })
          }
          style={{ cursor: "pointer" }}
        />
        <label
          htmlFor="useAi"
          style={{
            fontSize: "0.9rem",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          ✨ AI에게 태그 생성 및 내용 요약을 맡길게요
        </label>
      </div>

      {/* 하단 제어 버튼 (AI 로딩 유기적 연동) */}
      <div className="form-actions full-width">
        <button
          type="button"
          className="btn btn-secondary"
          disabled={isAiLoading} // 👈 AI 연산 중에는 취소 방지
          onClick={() => {
            setIsAddingNew(false);
            setIsEditingId(null);
          }}
        >
          취소
        </button>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isAiLoading} // 👈 AI 연산 중 중복 클릭 방지
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            backgroundColor: isAiLoading ? "#8b5cf6" : undefined,
            color: isAiLoading ? "#ffffff" : undefined,
          }}
        >
          {isAiLoading ? (
            <>
              <span className="ai-spinner">⏳</span> ✨ Gemma 4 분석 중...
            </>
          ) : isEditingId ? (
            "수정 완료"
          ) : (
            "발자취 남기기"
          )}
        </button>
      </div>
    </form>
  );
}