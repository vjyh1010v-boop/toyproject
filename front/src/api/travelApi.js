import axios from "axios";

// const BASE_URL = "http://localhost:8080/api/travels";

const BASE_URL = "http://210.119.14.73:8080/api/travels";

export const getTravels = async () => {
  const response = await axios.get(BASE_URL);
  return response.data;
};

export const createTravel = async (travelData) => {
  const response = await axios.post(BASE_URL, travelData);
  return response.data;
};

export const deleteTravel = async (id) => {
  await axios.delete(`${BASE_URL}/${id}`);
};

export const updateTravel = async (id, data) => {
  const response = await axios.put(`${BASE_URL}/${id}`, data);
  return response.data;
};

// 🚀 [추가] 1번: Ollama 실시간 채팅을 위한 API 엔드포인트 함수
export const chatWithAi = async (message) => {
  // 백엔드 서버에 유저가 입력한 질문(message)을 payload로 보냅니다.
  const response = await axios.post(`${BASE_URL}/chat`, { message });

  // 백엔드가 { reply: "AI가 보낸 답변 내용" } 구조로 응답한다고 가정합니다.
  return response.data;
};
