package com.toyproject.back.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.toyproject.back.entity.TravelEntry;

public interface TravelEntryRepository extends JpaRepository<TravelEntry, Long> {

}
