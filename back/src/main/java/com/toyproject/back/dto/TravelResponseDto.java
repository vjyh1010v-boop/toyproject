package com.toyproject.back.dto;

import java.time.LocalDate;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
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
}