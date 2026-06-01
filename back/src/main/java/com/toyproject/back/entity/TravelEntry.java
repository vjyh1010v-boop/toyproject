package com.toyproject.back.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Lob
    @Column(name = "AI_SUMMARY")
    private String aiSummary;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "travel_tags", 
        joinColumns = @JoinColumn(name = "travel_entry_id")
    )
    @Column(name = "tag_name")
    @Builder.Default
    private List<String> tags = new ArrayList<>(); // 💡 기본값을 가변 빈 리스트로 초기화해두면 더 안전합니다.

    /**
     * 💡 [중요] 외부에서 들어오는 수정 불가능한 리스트 방어용 커스텀 Setter
     * Lombok이 만드는 기본 setter 대신 이 메서드가 작동하여 에러를 원천 차단합니다.
     */
    public void setTags(List<String> tags) {
        if (tags == null) {
            this.tags = new ArrayList<>();
        } else {
            // 들어온 리스트가 무엇이든 새 ArrayList로 복사하여 가변성을 확보합니다.
            this.tags = new ArrayList<>(tags);
        }
    }
}