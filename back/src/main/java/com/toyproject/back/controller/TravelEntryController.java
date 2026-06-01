package com.toyproject.back.controller;

import java.util.ArrayList;
import java.util.List;
import org.springframework.web.bind.annotation.*;
import com.toyproject.back.dto.TravelRequestDto;
import com.toyproject.back.dto.TravelResponseDto;
import com.toyproject.back.dto.TravelAiResponse; // 💡 AI 응답 DTO 임포트
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.entity.User;
import com.toyproject.back.repository.TravelEntryRepository;
import com.toyproject.back.repository.UserRepository;
import com.toyproject.back.service.AiService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TravelEntryController {

    private final TravelEntryRepository travelEntryRepository;
    private final AiService aiService;
    private final UserRepository userRepository; // 💡 유저 확인용 리포지토리 추가

    /**
     * 🔍 1. 조회: 로그인한 사용자의 글만 가져오기
     */
    @GetMapping("/api/travels")
    public List<TravelEntry> getTravels(
        @RequestHeader("X-USER-USERNAME") String username // 👈 헤더에서 사용자 아이디 추출
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("인증되지 않은 사용자입니다."));
        
        // 전체 조회가 아닌, 로그인한 유저의 글만 필터링하여 반환합니다.
        return travelEntryRepository.findByUser(user);
    }

    /**
     * ✍️ 2. 작성: 글을 쓸 때 현재 로그인한 유저 정보 묶어서 저장하기
     */
    @PostMapping("/api/travels")
    public TravelResponseDto createTravel(
        @RequestHeader("X-USER-USERNAME") String username, // 👈 헤더에서 작성자 추출
        @RequestBody TravelRequestDto request
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("인증되지 않은 사용자입니다."));

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
        
        // 💡 [중요] 이 게시글의 주인(작성자)이 누구인지 세팅합니다.
        travelEntry.setUser(user); 

        // 💡 2. DB 저장 전에 내용이 있다면 Gemma 4를 깨워 분석합니다.
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            // 💡 조건 추가: AI를 사용한다고 체크한 경우에만 실행
            if (request.isUseAi()) {
                TravelAiResponse aiResponse = aiService.generateAiAnalysis(request.getTitle(), request.getContent());
                travelEntry.setAiSummary(aiResponse.getSummary());
                travelEntry.setTags(aiResponse.getTags());
            } else {
                // AI를 안 쓰면 기본값 처리 (필요시)
                travelEntry.setAiSummary("직접 작성한 기록");
                travelEntry.setTags(new ArrayList<>());
            }
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
                .aiSummary(saved.getAiSummary())
                .tags(saved.getTags())
                .build();
    }

    /**
     * ❌ 3. 삭제: 본인 글이 맞는지 권한 검증 후 삭제
     */
    @DeleteMapping("/api/travels/{id}")
    public void deleteTravel(
        @RequestHeader("X-USER-USERNAME") String username, // 👈 헤더에서 요청자 추출
        @PathVariable("id") Long id
    ) {
        TravelEntry entry = travelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 기록을 찾을 수 없습니다."));

        // 💡 보안 검증: 현재 로그인한 사람의 username과 글쓴이의 username이 같은지 검사
        if (!entry.getUser().getUsername().equals(username)) {
            throw new RuntimeException("본인이 작성한 글만 삭제할 수 있습니다.");
        }

        travelEntryRepository.delete(entry);
    }

   /**
     * 🔄 4. 수정: 본인 글이 맞는지 권한 검증 후 수정 처리
     */
    @PutMapping("/api/travels/{id}")
    public TravelResponseDto updateTravel(
            @RequestHeader("X-USER-USERNAME") String username,
            @PathVariable("id") Long id,
            @RequestBody TravelRequestDto request
    ) {
        TravelEntry entry = travelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        if (!entry.getUser().getUsername().equals(username)) {
            throw new RuntimeException("본인이 작성한 글만 수정할 수 있습니다.");
        }

        entry.setTitle(request.getTitle());
        entry.setLocationName(request.getLocationName());
        entry.setTravelDate(request.getTravelDate());
        entry.setContent(request.getContent());
        entry.setLatitude(request.getLatitude());
        entry.setLongitude(request.getLongitude());
        entry.setVisits(request.getVisits());
        entry.setImageUrl(request.getImageUrl());
        entry.setRegion(request.getRegion());

        // 기존 로직
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            // 💡 조건 추가
            if (request.isUseAi()) {
                TravelAiResponse aiResponse = aiService.generateAiAnalysis(request.getTitle(), request.getContent());
                entry.setAiSummary(aiResponse.getSummary());
                if (aiResponse.getTags() != null) {
                    entry.setTags(new ArrayList<>(aiResponse.getTags()));
                }
            } else {
                // AI를 안 쓰면 기존 내용을 유지하거나 초기화
                entry.setAiSummary("직접 작성한 기록");
                entry.setTags(new ArrayList<>());
            }
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
                .aiSummary(saved.getAiSummary())
                .tags(saved.getTags())
                .build();
    }

    @PostMapping("/api/travels/chat")
    public java.util.Map<String, String> chatWithAi(
        @RequestBody java.util.Map<String, String> request
    ) {
        String userMessage = request.get("message");
        String aiReply = aiService.generateAiChat(userMessage);
        
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("reply", aiReply);
        
        return response;
    }
}