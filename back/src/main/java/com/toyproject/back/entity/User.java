package com.toyproject.back.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "PROJECT_USER") //ORACLE에서 USER는 예약어라 테이블 이름을 따로 지정해 주는 것
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true) // 중복 아이디 방지
    private String username; // 사용자 로그인 아이디

    @Column(nullable = false)
    private String password; // 암호화되어 저장될 비밀번호

    @Column(nullable = false)
    private String name; // 사용자 실제 이름
}
