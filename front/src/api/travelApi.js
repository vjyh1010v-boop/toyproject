import axios from "axios";

// const BASE_URL = "http://localhost:8080/api/travels";

const BASE_URL = "http://210.119.14.73:8080/api/travels";

/**
 * 💡 공통 헤더를 가져오는 헬퍼 함수
 * 브라우저 스토리지에 저장된 username을 가져와 백엔드가 요구하는 헤더 형식으로 만듭니다.
 */
const getAuthHeaders = () => {
  const username = localStorage.getItem("username");
  return {
    headers: {
      "X-USER-USERNAME": username || "", // username이 없으면 빈 값 전송
    },
  };
};

// 🔍 1. 조회: 로그인한 유저의 글만 가져오도록 헤더 추가
export const getTravels = async () => {
  const response = await axios.get(BASE_URL, getAuthHeaders());
  return response.data;
};

// ✍️ 2. 작성: 내가 쓴 글임을 알리기 위해 헤더 추가
export const createTravel = async (travelData) => {
  // post 요청은 (주소, 데이터, 설정) 순서이므로 세 번째 인자에 헤더를 넣습니다.
  const response = await axios.post(BASE_URL, travelData, getAuthHeaders());
  return response.data;
};

// ❌ 3. 삭제: 본인 글만 삭제할 수 있도록 권한 확인용 헤더 추가
export const deleteTravel = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`, getAuthHeaders());
};

// 🔄 4. 수정: 본인 글만 수정할 수 있도록 권한 확인용 헤더 추가
export const updateTravel = async (id, data) => {
  // put 요청도 (주소, 데이터, 설정) 순서입니다.
  const response = await axios.put(`${BASE_URL}/${id}`, data, getAuthHeaders());
  return response.data;
};

// 🚀 [유지] Ollama 실시간 채팅을 위한 API (채팅은 권한 검증이 필요 없으므로 기존 유지)
export const chatWithAi = async (message) => {
  const response = await axios.post(`${BASE_URL}/chat`, { message });
  return response.data;
};
