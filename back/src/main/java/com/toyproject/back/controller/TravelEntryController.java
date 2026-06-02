package com.toyproject.back.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.toyproject.back.dto.TravelRequestDto;
import com.toyproject.back.dto.TravelResponseDto;
import com.toyproject.back.dto.TravelAiResponse;
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.entity.User;
import com.toyproject.back.repository.TravelEntryRepository;
import com.toyproject.back.repository.UserRepository;
import com.toyproject.back.service.AiService;
import com.toyproject.back.service.FileService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TravelEntryController {

    private final TravelEntryRepository travelEntryRepository;
    private final AiService aiService;
    private final UserRepository userRepository;
    private final FileService fileService;

    /**
     * 🔍 1. 조회: 로그인한 사용자의 글만 가져오기
     */
    @GetMapping("/api/travels")
    public List<TravelResponseDto> getTravels( // 💡 [수정] 프론트엔드가 DTO 안의 tags를 명확히 읽을 수 있도록 리턴 타입을 DTO 리스트로 보완합니다.
        @RequestHeader("X-USER-USERNAME") String username 
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("인증되지 않은 사용자입니다."));
        
        List<TravelEntry> entries = travelEntryRepository.findByUser(user);
        List<TravelResponseDto> dtoList = new ArrayList<>();

        // 💡 JPA 지연 로딩 프록시를 깨우고 완벽하게 조립해서 프론트엔드로 전달합니다.
        for (TravelEntry saved : entries) {
            TravelResponseDto dto = TravelResponseDto.builder()
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
                    .tags(saved.getTags()) // 🌟 오라클에 저장되어 있던 내 태그가 화면으로 정상 공급됩니다.
                    .build();
            dtoList.add(dto);
        }
        return dtoList;
    }

    /**
     * ✍️ 2. 작성: 글을 쓸 때 현재 로그인한 유저 정보 및 사진 파일 함께 묶어서 저장하기
     */
    @PostMapping(value = "/api/travels", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE})
    public TravelResponseDto createTravel(
        @RequestHeader("X-USER-USERNAME") String username,
        @RequestPart("request") TravelRequestDto request, // 💡 @RequestBody를 @RequestPart로 수정하여 멀티파트 에러 원천 차단
        @RequestPart(value = "file", required = false) MultipartFile file
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
        travelEntry.setRegion(request.getRegion());
        travelEntry.setTravelDate(request.getTravelDate());
        
        // 🌟 [최초 주입] 사용자가 프론트엔드에서 직접 입력한 태그를 먼저 탑재합니다.
        travelEntry.setTags(request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>());
        
        travelEntry.setUser(user); 

        // 📍 파일 업로드 서비스 적용
        if (file != null && !file.isEmpty()) {
            String savedImageUrl = fileService.uploadImage(file);
            travelEntry.setImageUrl(savedImageUrl);
        } else {
            travelEntry.setImageUrl(request.getImageUrl());
        }

        // Gemma 4 AI 분석 로직
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            if (request.isUseAi()) {
                TravelAiResponse aiResponse = aiService.generateAiAnalysis(request.getTitle(), request.getContent());
                travelEntry.setAiSummary(aiResponse.getSummary());
                
                // 🌟 [보완] AI 태그를 생성한 경우, 사용자가 기존에 작성한 태그 리스트에 결합(addAll)해 줍니다.
                if (aiResponse.getTags() != null) {
                    List<String> combinedTags = travelEntry.getTags();
                    combinedTags.addAll(aiResponse.getTags());
                    travelEntry.setTags(combinedTags);
                }
            } else {
                travelEntry.setAiSummary("직접 작성한 기록");
                // 🛑 [기존 버그 수정] 기존에는 여기서 travelEntry.setTags(new ArrayList<>()); 로 초기화해버려 
                // 사용자가 열심히 작성한 태그가 삭제되었습니다. 이 부분을 과감히 삭제하여 사용자의 태그를 유지합니다!
            }
        }

        TravelEntry saved = travelEntryRepository.save(travelEntry);

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
        @RequestHeader("X-USER-USERNAME") String username, 
        @PathVariable("id") Long id
    ) {
        TravelEntry entry = travelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("해당 기록을 찾을 수 없습니다."));

        if (!entry.getUser().getUsername().equals(username)) {
            throw new RuntimeException("본인이 작성한 글만 삭제할 수 있습니다.");
        }

        travelEntryRepository.delete(entry);
    }

   /**
     * 🔄 4. 수정: 본인 글이 맞는지 권한 검증 후 수정 처리 (사진 수정 완벽 대응)
     */
    @PutMapping(value = "/api/travels/{id}", consumes = {MediaType.MULTIPART_FORM_DATA_VALUE}) // 💡 멀티파트 설정 추가
    public TravelResponseDto updateTravel(
            @RequestHeader("X-USER-USERNAME") String username,
            @PathVariable("id") Long id,
            @RequestPart("request") TravelRequestDto request, // 💡 @RequestBody -> @RequestPart로 변경
            @RequestPart(value = "file", required = false) MultipartFile file // 💡 수정용 이미지 파일 추가 매개변수 도입
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
        entry.setRegion(request.getRegion());
        
        // 🌟 [수정 반영] 프론트에서 수정되어 들어온 새 직접 태그 목록을 반영합니다.
        entry.setTags(request.getTags() != null ? new ArrayList<>(request.getTags()) : new ArrayList<>());

        // 📍 수정 시 새로운 사진이 들어오면 덮어쓰고, 없으면 프론트에서 넘어온 기존 경로(또는 null)를 유지합니다.
        if (file != null && !file.isEmpty()) {
            String savedImageUrl = fileService.uploadImage(file);
            entry.setImageUrl(savedImageUrl);
        } else {
            entry.setImageUrl(request.getImageUrl());
        }

        // AI 분석 수정 로직
        if (request.getContent() != null && !request.getContent().trim().isEmpty()) {
            if (request.isUseAi()) {
                TravelAiResponse aiResponse = aiService.generateAiAnalysis(request.getTitle(), request.getContent());
                entry.setAiSummary(aiResponse.getSummary());
                if (aiResponse.getTags() != null) {
                    // AI 태그가 생성되었다면 사용자가 수정한 태그에 함께 이어붙여 줍니다.
                    List<String> combinedTags = entry.getTags();
                    combinedTags.addAll(aiResponse.getTags());
                    entry.setTags(combinedTags);
                }
            } else {
                entry.setAiSummary("직접 작성한 기록");
                // 🛑 [기존 버그 수정] 수정할 때도 AI를 체크 안 하면 기존 작성 태그를 통째로 지워버리던 코드를 걷어내어 데이터를 보존합니다.
            }
        }

        TravelEntry saved = travelEntryRepository.save(entry);

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