package com.toyproject.back.dto;

import java.time.LocalDate;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TravelRequestDto {

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