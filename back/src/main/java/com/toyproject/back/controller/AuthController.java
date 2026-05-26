package com.toyproject.back.controller;

import com.toyproject.back.entity.User;
import com.toyproject.back.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173") // 리액트 서버(5173)에서 오는 요청을 허용해주는 CORS 설정!
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    /**
     * 🚪 1. 리액트에서 회원가입 요청을 받는 문(Endpoint)
     * 주소창 기준: http://localhost:8080/api/auth/signup
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody User user) {
        try {
            // 리액트가 보낸 회원 데이터를 서비스의 registerUser 메서드로 전달합니다.
            String resultMessage = userService.registerUser(user);
            
            // 가입이 성공하면 200 OK 상태 코드와 함께 성공 메시지를 보냅니다.
            return ResponseEntity.ok(resultMessage);
            
        } catch (IllegalArgumentException e) {
            // 만약 아이디가 중복되어 서비스에서 예외가 발생했다면, 
            // 400 Bad Request 상태 코드와 함께 에러 메시지("이미 존재하는 아이디입니다.")를 보냅니다.
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 🔑 2. 리액트에서 로그인 요청을 받는 문(Endpoint)
     * 주소창 기준: http://localhost:8080/api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        try {
            User user = userService.loginUser(loginRequest.getUsername(), loginRequest.getPassword());
            return ResponseEntity.ok(user);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}