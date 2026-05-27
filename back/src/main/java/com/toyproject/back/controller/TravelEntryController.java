package com.toyproject.back.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.toyproject.back.dto.TravelRequestDto;
import com.toyproject.back.dto.TravelResponseDto;
import com.toyproject.back.dto.TravelAiResponse; // 💡 AI 응답 DTO 임포트
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.repository.TravelEntryRepository;
import com.toyproject.back.service.TravelService; // 💡 AI 전용 서비스 임포트

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TravelEntryController {

    private final TravelEntryRepository travelEntryRepository;
    private final TravelService travelService; // 💡 1. 든든한 AI 서비스 주입 받기

    @GetMapping("/api/travels")
    public List<TravelEntry> getTravels() {
        return travelEntryRepository.findAll();
    }

    @PostMapping("/api/travels")
    public TravelResponseDto createTravel(
        @RequestBody TravelRequestDto request
    ) {
        TravelEntry travelEntry = new TravelEntry();

        travelEntry.setTitle(request.getTitle());
        travelEntry.setLocationName(request.getLocationName());
        travelEntry.setContent(request.getContent());
        travelEntry.setLatitude(request.getLatitude());
        travelEntry.setLongitude(request.getLongitude());
        travelEntry.setVisits(request.getVisits());
        travelEntry.setImageUrl(request.getImageUrl());
        travelEntry.setRegion(request.getRegion());
        travelEntry.setTravelDate(request.getTravelDate());

        // 💡 2. DB 저장 전에 내용이 있다면 Gemma 4를 깨워 분석합니다.
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            TravelAiResponse aiResponse = travelService.generateAiAnalysis(request.getTitle(), request.getContent());
            travelEntry.setAiSummary(aiResponse.getSummary());
            travelEntry.setTags(aiResponse.getTags());
        }

        TravelEntry saved = travelEntryRepository.save(travelEntry);

        // 💡 3. 리액트가 응답을 즉시 받아 그릴 수 있도록 빌더에 AI 결과를 꽂아줍니다.
        return TravelResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .locationName(saved.getLocationName())
                .travelDate(saved.getTravelDate())
                .content(saved.getContent())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .visits(saved.getVisits())
                .imageUrl(saved.getImageUrl())
                .region(saved.getRegion())
                .aiSummary(saved.getAiSummary()) // 👈 여기에 추가!
                .tags(saved.getTags())           // 👈 여기에 추가!
                .build();
    }

    @DeleteMapping("/api/travels/{id}")
    public void deleteTravel(
        @PathVariable("id") Long id
    ) {
        travelEntryRepository.deleteById(id);
    }

    @PutMapping("/api/travels/{id}")
    public TravelResponseDto updateTravel(
            @PathVariable("id") Long id,
            @RequestBody TravelRequestDto request
    ) {
        TravelEntry entry = travelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        entry.setTitle(request.getTitle());
        entry.setLocationName(request.getLocationName());
        entry.setTravelDate(request.getTravelDate());
        entry.setContent(request.getContent());
        entry.setLatitude(request.getLatitude());
        entry.setLongitude(request.getLongitude());
        entry.setVisits(request.getVisits());
        entry.setImageUrl(request.getImageUrl());
        entry.setRegion(request.getRegion());

        // 💡 4. 글을 수정할 때도 추억 내용이 바뀌었다면 AI 분석을 새로 갱신합니다.
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            TravelAiResponse aiResponse = travelService.generateAiAnalysis(request.getTitle(), request.getContent());
            entry.setAiSummary(aiResponse.getSummary());
            entry.setTags(aiResponse.getTags());
        }

        TravelEntry saved = travelEntryRepository.save(entry);

        // 💡 5. 수정 완료 응답객체에도 AI 결과를 얹어줍니다.
        return TravelResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .locationName(saved.getLocationName())
                .travelDate(saved.getTravelDate())
                .content(saved.getContent())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .visits(saved.getVisits())
                .imageUrl(saved.getImageUrl())
                .region(saved.getRegion())
                .aiSummary(saved.getAiSummary()) // 👈 여기에 추가!
                .tags(saved.getTags())           // 👈 여기에 추가!
                .build();
    }

    @PostMapping("/api/travels/chat")
    public java.util.Map<String, String> chatWithAi(
        @RequestBody java.util.Map<String, String> request
    ) {
        // 프론트엔드에서 보낸 질문 추출
        String userMessage = request.get("message");
        
        // 💡 기존에 요약할 때 사용하던 travelService에 일반 대화용 메서드를 하나 요청합니다.
        // (메서드명은 프로젝트 상황에 맞게 travelService 내부를 가볍게 수정하거나 구현해 주시면 됩니다!)
        String aiReply = travelService.generateAiChat(userMessage);
        
        // 프론트엔드가 요구하는 { "reply": "답변 내용" } 맵 구조로 리턴
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("reply", aiReply);
        
        return response;
    }
}