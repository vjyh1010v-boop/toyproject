import React, { useState, useEffect } from "react";
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
  // 📍 로컬에서 관리할 임시 이미지 미리보기 URL 상태
  const [previewUrl, setPreviewUrl] = useState("");

  // 📍 컴포넌트가 켜지거나 수정 모드로 진입할 때 기존 이미지가 있으면 미리보기에 노출
  useEffect(() => {
    if (formData.imageFile) {
      // 새로 파일 창에서 선택한 파일 객체가 들어있을 경우
      setPreviewUrl(URL.createObjectURL(formData.imageFile));
    } else if (formData.imageUrl) {
      // 수정 모드 등에서 기존 서버 URL이 넘어온 경우
      // 만약 상대경로(/images/...)로 들어온다면 스프링 주소를 붙여서 바인딩
      const baseUrl = formData.imageUrl.startsWith("http")
        ? ""
        : "http://localhost:8080";
      setPreviewUrl(`${baseUrl}${formData.imageUrl}`);
    } else {
      setPreviewUrl("");
    }

    // 메모리 누수 방지를 위한 Clean-up
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [formData.imageFile, formData.imageUrl]);

  // 📍 파일 컴포넌트 내 핸들러 가공
  const onFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // 1. App.jsx 등 상위 컴포넌트의 업로드 핸들러(EXIF 추출 등이 있다면) 호출
      if (handlePhotoUpload) {
        handlePhotoUpload(e);
      }
      // 2. 상위의 formData 상태 구조에 파일 객체 꽂아넣기
      setFormData({ ...formData, imageFile: selectedFile });
    }
  };

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

      {/* 📍 사진 업로드 & 미리보기 필드 */}
      <div className="form-group full-width" style={{ marginBottom: "5px" }}>
        <label className="form-label">
          여행 사진 첨부 📸
          {exifStatus && exifStatus.message && (
            <span
              style={{
                fontSize: "0.8rem",
                color: "#10b981",
                marginLeft: "8px",
              }}
            >
              ({exifStatus.message})
            </span>
          )}
        </label>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef} // 부모로부터 전달받은 ref 바인딩
          onChange={onFileChange}
          className="form-input"
          style={{ padding: "6px" }}
        />

        {/* 선택한 이미지 미리보기 화면 출력 */}
        {previewUrl && (
          <div style={{ marginTop: "10px", position: "relative" }}>
            <img
              src={previewUrl}
              alt="선택된 여행 사진"
              style={{
                width: "100%",
                maxHeight: "180px",
                objectFit: "cover",
                borderRadius: "6px",
                border: "1px solid var(--border-color, #e5e7eb)",
              }}
            />
          </div>
        )}
      </div>

      {/* AI 토글 체크박스 */}
      <div
        className="ai-toggle-group full-width" // 💡 그리드 정렬 유지를 위해 full-width 권장
        style={{
          marginTop: "5px",
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
