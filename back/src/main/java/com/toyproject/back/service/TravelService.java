package com.toyproject.back.service;

import com.toyproject.back.dto.TravelEntryDto;
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.repository.TravelEntryRepository;

import lombok.RequiredArgsConstructor;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TravelService {

    private final TravelEntryRepository travelEntryRepository; // 💡 1. DB 조회를 위해 리포지토리 주입

    // AI 호출 로직을 제거하고, 순수하게 데이터 저장 역할만 수행합니다.
    public TravelEntry createTravel(TravelEntryDto dto) {
        TravelEntry entry = TravelEntry.builder()
                .title(dto.getTitle())
                .locationName(dto.getLocationName())
                .travelDate(dto.getTravelDate())
                .content(dto.getContent())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .visits(dto.getVisits())
                .imageUrl(dto.getImageUrl())
                .region(dto.getRegion())
                .build();

        return travelEntryRepository.save(entry);
    }
}