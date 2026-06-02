package com.toyproject.back.dto;

import java.time.LocalDate;
import java.util.List;

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

    private boolean useAi;

    private List<String> tags;

    public TravelEntryDto toDto() {
        return TravelEntryDto.builder()
                .title(this.title)
                .locationName(this.locationName)
                .content(this.content)
                .travelDate(this.travelDate)
                .latitude(this.latitude)
                .longitude(this.longitude)
                .visits(this.visits)
                .imageUrl(this.imageUrl)
                .region(this.region)
                .useAi(this.useAi) // AI 사용 여부 포함
                .build();
    }
}