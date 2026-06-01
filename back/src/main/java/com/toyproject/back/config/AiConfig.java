package com.toyproject.back.config;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AiConfig {

    @Bean
    public ChatClient chatClient(ChatClient.Builder builder) {
        // builder를 통해 ChatClient를 생성하여 빈으로 등록
        return builder.build();
    }
}