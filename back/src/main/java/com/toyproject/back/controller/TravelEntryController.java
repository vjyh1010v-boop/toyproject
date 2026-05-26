package com.toyproject.back.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.toyproject.back.dto.TravelRequestDto;
import com.toyproject.back.dto.TravelResponseDto;
import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.repository.TravelEntryRepository;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
public class TravelEntryController {

    private final TravelEntryRepository travelEntryRepository;

    @GetMapping("/api/travels")
    public List<TravelEntry> getTravels() {
        return travelEntryRepository.findAll();
    }

    @PostMapping("/api/travels")
    public TravelResponseDto createTravel(
        @RequestBody TravelRequestDto request
    ) {

        TravelEntry travelEntry = new TravelEntry();

        travelEntry.setTitle(request.getTitle());

        travelEntry.setLocationName(request.getLocationName());

        travelEntry.setContent(request.getContent());

        travelEntry.setLatitude(request.getLatitude());

        travelEntry.setLongitude(request.getLongitude());

        travelEntry.setVisits(request.getVisits());

        travelEntry.setImageUrl(request.getImageUrl());

        travelEntry.setRegion(request.getRegion());

        travelEntry.setTravelDate(request.getTravelDate());

        TravelEntry saved =
            travelEntryRepository.save(travelEntry);

        return TravelResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .locationName(saved.getLocationName())
                .travelDate(saved.getTravelDate())
                .content(saved.getContent())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .visits(saved.getVisits())
                .imageUrl(saved.getImageUrl())
                .region(saved.getRegion())
                .build();
    }

    @DeleteMapping("/api/travels/{id}")
    public void deleteTravel(
        @PathVariable Long id
    ) {
        
        travelEntryRepository.deleteById(id);
    }

    @PutMapping("/api/travels/{id}")
    public TravelResponseDto updateTravel(
            @PathVariable("id") Long id,
            @RequestBody TravelRequestDto request
    ) {

        TravelEntry entry = travelEntryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel not found"));

        entry.setTitle(request.getTitle());
        entry.setLocationName(request.getLocationName());
        entry.setTravelDate(request.getTravelDate());
        entry.setContent(request.getContent());
        entry.setLatitude(request.getLatitude());
        entry.setLongitude(request.getLongitude());
        entry.setVisits(request.getVisits());
        entry.setImageUrl(request.getImageUrl());
        entry.setRegion(request.getRegion());

        TravelEntry saved = travelEntryRepository.save(entry);

        return TravelResponseDto.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .locationName(saved.getLocationName())
                .travelDate(saved.getTravelDate())
                .content(saved.getContent())
                .latitude(saved.getLatitude())
                .longitude(saved.getLongitude())
                .visits(saved.getVisits())
                .imageUrl(saved.getImageUrl())
                .region(saved.getRegion())
                .build();
    }
}
