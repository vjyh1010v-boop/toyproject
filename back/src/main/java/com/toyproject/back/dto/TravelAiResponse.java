package com.toyproject.back.dto;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TravelAiResponse {
    private String summary;   // AI 한 줄 요약
    private List<String> tags; // AI 추천 해시태그 목록
}