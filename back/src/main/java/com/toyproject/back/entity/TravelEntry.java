package com.toyproject.back.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
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
}