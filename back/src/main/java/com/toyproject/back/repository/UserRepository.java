package com.toyproject.back.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.toyproject.back.entity.User;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // 회원 가입 시 중복 체크
    boolean existsByUsername(String username);

    // 로그인 시 유저 정보 조회
    Optional<User> findByUsername(String username);
}
