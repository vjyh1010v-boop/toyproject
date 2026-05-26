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
}) {
  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <h2
        className="form-group full-width"
        style={{ color: "var(--text-primary)", margin: "0 0 0.5rem 0" }}
      >
        {isEditingId ? "발자취 수정" : "새 발자취 추가"}
      </h2>

      {/* 제목 필드 */}
      <div className="form-group full-width">
        <label className="form-label">제목</label>
        <input
          className="form-input"
          value={formData.title || ""}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="여행의 제목을 입력하세요"
          required
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

      {/* 위도 / 경도 필드 */}
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

      {/* 하단 제어 버튼 */}
      <div className="form-actions full-width">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => {
            setIsAddingNew(false);
            setIsEditingId(null);
          }}
        >
          취소
        </button>
        <button type="submit" className="btn btn-primary">
          {isEditingId ? "수정 완료" : "발자취 남기기"}
        </button>
      </div>
    </form>
  );
}
