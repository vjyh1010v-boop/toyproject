package com.toyproject.back.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.toyproject.back.entity.TravelEntry;
import com.toyproject.back.entity.User;

public interface TravelEntryRepository extends JpaRepository<TravelEntry, Long> {
// 💡 로그인한 특정 유저가 작성한 게시글만 조회하는 쿼리 메서드 추가!
    List<TravelEntry> findByUser(User user);
    

}
