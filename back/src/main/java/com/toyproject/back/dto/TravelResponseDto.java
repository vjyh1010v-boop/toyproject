package com.toyproject.back.dto;

import java.time.LocalDate;
import java.util.List; // 💡 List 임포트 추가
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor; // 💡 기본 생성자 임포트 추가

@Getter
@Builder
@NoArgsConstructor  // 💡 JPA나 Jackson 매퍼가 역직렬화할 때 안정성을 위해 추가
@AllArgsConstructor
public class TravelResponseDto {

    private Long id;

    private String title;

    private String locationName;

    private LocalDate travelDate;

    private String content;

    private Double latitude;

    private Double longitude;

    private Integer visits;

    private String imageUrl;

    private String region;

    // 🚀 [AI 피처 추가] 1. 프론트엔드로 넘겨줄 AI 한 줄 요약
    private String aiSummary;

    // 🚀 [AI 피처 추가] 2. 프론트엔드로 넘겨줄 해시태그 리스트
    private List<String> tags;
}