package com.toyproject.back.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder              // 💡 빌더 패턴 사용 가능하게 함
@AllArgsConstructor   // 💡 @Builder를 위해 필수!
@NoArgsConstructor    // 💡 데이터 변환 시 필요
public class TravelEntryDto {
    private String title;
    private String locationName;
    private LocalDate travelDate;
    private String content;
    private Double latitude;
    private Double longitude;
    private Integer visits;
    private String imageUrl;
    private String region;
    
    // 💡 AI 토글 여부를 받을 필드 추가
    private boolean useAi; 
}