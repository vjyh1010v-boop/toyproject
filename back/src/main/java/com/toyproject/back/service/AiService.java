package com.toyproject.back.service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.ollama.OllamaChatModel;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.toyproject.back.dto.TravelAiResponse;
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.repository.TravelEntryRepository;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AiService {

    private final TravelEntryRepository travelEntryRepository;
    private final OllamaChatModel chatModel; // AI 기능 수행용
    private final ObjectMapper objectMapper;
    private final ChatClient chatClient;

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

    public String generateAiChat(String userMessage) {
        try {
            List<TravelEntry> entries = travelEntryRepository.findAll();
            String travelHistory = entries.stream()
                .map(e -> String.format("- ID: %d, %s, %s", e.getId(), e.getTitle(), e.getLocationName()))
                .collect(Collectors.joining("\n"));

            return chatClient.prompt()
                    .user(userMessage)
                    .system(s -> s.text("당신은 여행 비서입니다. 삭제 요청 시 반드시 'deleteTravel' 도구를 사용하세요. 데이터: {records}")
                                .param("records", travelHistory))
                    // 💡 여기서 반드시 .tools(this)를 넣어주세요.
                    .tools(this) 
                    .call()
                    .content();

        } catch (Exception e) {
            return "오류가 발생했습니다.";
        }
    }

    @Tool(name = "findAllTravels", description = "DB에 저장된 모든 여행 기록을 조회하여 ID, 제목, 장소를 반환합니다.")
    public List<TravelEntry> findAllTravels() {
        return travelEntryRepository.findAll();
    }

    // TravelService 의존성 삭제
    @Tool(name = "createTravelEntry", description = "입력받은 정보를 바탕으로 새로운 여행 기록을 DB에 저장합니다.")
    public void createTravelEntry(String title, String locationName, String content, String travelDate) {
        // travelService를 부르는 대신 여기서 직접 엔티티 생성 및 저장
        TravelEntry entry = TravelEntry.builder()
                .title(title)
                .locationName(locationName)
                .content(content)
                .travelDate(LocalDate.parse(travelDate))
                .build();
        travelEntryRepository.save(entry);
    }

    // AI가 요약과 태그를 생성하는 메서드들
    public String generateSummary(String content) {
        return chatModel.call("다음 내용을 한 문장으로 요약해줘: " + content);
    }

    public String generateTags(String content) {
        return chatModel.call("다음 내용에서 핵심 키워드 3개를 콤마(,)로 구분해서 추출해줘: " + content);
    }
}