package com.toyproject.back.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Entity
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TravelEntry {

    @Id
    @SequenceGenerator(
            name = "travel_seq_generator",
            sequenceName = "travel_seq",
            allocationSize = 1
    )
    @GeneratedValue(
            strategy = GenerationType.SEQUENCE,
            generator = "travel_seq_generator"
    )
    private Long id;

    private String title;

    private String locationName;

    private LocalDate travelDate;

    @Column(length = 2000)
    private String content;

    private Double latitude;

    private Double longitude;

    private Integer visits;

    private String imageUrl;

    private String region;

    // 💡 [AI 피처 추가] 1. AI 한 줄 요약 필드 (글자 수 제한을 넉넉히 TEXT로 설정)
    @Lob
    @Column(name = "AI_SUMMARY")
    private String aiSummary;

    // 💡 [AI 피처 추가] 2. AI 추천 해시태그 목록 필드
    // JPA에서 간단한 문자열 리스트를 별도 매핑 테이블로 관리해 주는 어노테이션입니다.
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "travel_tags", 
        joinColumns = @JoinColumn(name = "travel_entry_id")
    )
    @Column(name = "tag_name")
    private List<String> tags;
}