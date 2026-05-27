package com.toyproject.back.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toyproject.back.dto.TravelAiResponse;
import com.toyproject.back.repository.TravelEntryRepository;

import java.util.List;

import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class TravelService {

    @Autowired
    private OllamaChatModel chatModel;

    @Autowired
    private ObjectMapper objectMapper; // JSON 파싱용

    @Autowired
    private TravelEntryRepository travelEntryRepository; // 💡 1. DB 조회를 위해 리포지토리 주입

    /**
     * 기존 여행 일기 요약 및 태그 분석 기능
     */
    public TravelAiResponse generateAiAnalysis(String title, String content) {
        String prompt = String.format(
            "너는 여행 일기를 분석하는 전문가야. 아래의 여행 일기를 읽고 반드시 지정된 JSON 포맷으로만 답변해줘. 다른 말은 절대 하지마.\n\n" +
            "응답 형식:\n" +
            "{\"summary\": \"여행 일기의 감성적인 한 줄 요약 (최대 30자)\", \"tags\": [\"감정태그1\", \"장소태그2\", \"분위기태그3\"]}\n\n" +
            "[여행 일기]\n" +
            "제목: %s\n" +
            "내용: %s", title, content
        );

        try {
            String rawResponse = chatModel.call(prompt);
            String cleanJson = rawResponse.replaceAll("```json|```", "").trim();
            return objectMapper.readValue(cleanJson, TravelAiResponse.class);
        } catch (Exception e) {
            System.err.println("AI 분석 실패: " + e.getMessage());
            TravelAiResponse fallback = new TravelAiResponse();
            fallback.setSummary("소중한 발자취가 기록되었습니다.");
            fallback.setTags(List.of("여행", "추억"));
            return fallback;
        }
    }

    // 🚀 [수정] 내 여행 데이터를 학습시켜 답변하는 실시간 채팅 메서드
    public String generateAiChat(String userMessage) {
        try {
            // 2. DB에서 유저가 등록한 모든 여행 발자취 가져오기
            List<com.toyproject.back.entity.TravelEntry> entries = travelEntryRepository.findAll();
            
            // 3. AI가 읽기 편하게 기록들을 문자열로 예쁘게 조립하기
            StringBuilder travelHistory = new StringBuilder();
            if (entries.isEmpty()) {
                travelHistory.append("현재 등록된 여행 기록이 없습니다.");
            } else {
                for (com.toyproject.back.entity.TravelEntry entry : entries) {
                    travelHistory.append(String.format("- 날짜: %s, 제목: %s, 장소: %s\n", 
                        entry.getTravelDate(), entry.getTitle(), entry.getLocationName()));
                }
            }

            // 4. 💡 핵심: AI에게 지침(System) + 내 여행 데이터(Context) + 질문을 한 번에 주입!
            String systemPrompt = "너는 유저의 소중한 기록을 모두 알고 있는 든든한 개인 여행 비서야.\n"
                                + "아래 [유저의 여행 기록]을 바탕으로 질문에 친절하고 정확하게 한글로 답변해줘.\n"
                                + "기록에 없는 내용은 지어내지 말고 모른다고 하거나 유저에게 물어봐.\n\n"
                                + "[유저의 여행 기록]\n" 
                                + travelHistory.toString() + "\n"
                                + "유저 질문: " + userMessage + "\n"
                                + "답변: ";

            // 5. Ollama 호출
            String response = chatModel.call(systemPrompt);
            
            if (response == null || response.trim().isEmpty()) {
                return "음... 기록을 찾아보고 있어요. 잠시 후 다시 물어봐 주세요!";
            }
            
            return response.trim();
        } catch (Exception e) {
            System.err.println("AI 채팅 통신 실패: " + e.getMessage());
            return "❌ 로컬 AI 엔진 호출 중 에러가 발생했습니다.";
        }
    }
}