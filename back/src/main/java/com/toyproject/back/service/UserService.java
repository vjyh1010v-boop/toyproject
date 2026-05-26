package com.toyproject.back.service;

import com.toyproject.back.entity.User;
import com.toyproject.back.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional 
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String registerUser(User user) {
        
        //아이디 중복 검사
        if (userRepository.existsByUsername(user.getUsername())) {

            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // (2) ⚠️ 중요: 비밀번호 암호화 처리가 원래 들어가야 하는 자리입니다.
        // 현재는 첫 연동 테스트를 위해 리액트가 보낸 비번 그대로 저장하고,
        // 통신이 성공하면 추후에 팀원분과 스프링 시큐리티(BCrypt) 보안을 입히는 것을 추천합니다!

        // (3) 중복 통과 시 DB 창고에 최종 저장
        userRepository.save(user);
        
        return "회원가입이 성공적으로 완료되었습니다!";
    }

    public User loginUser(String username, String password) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 아이디입니다."));
        
        if (!user.getPassword().equals(password)) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }
        
        return user;
    }
}