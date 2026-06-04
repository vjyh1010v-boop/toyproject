package com.toyproject.back.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    // application.properties에 설정하신 "D:/upload/toyproject" 값이 주입됩니다.
    @Value("${file.upload-dir}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 브라우저가 /images/~~ 로 접근을 시도하면
        registry.addResourceHandler("/images/**")
                // 실제 디렉토리 경로인 file:D:/upload/toyproject/ 로 연결해 줍니다.
                .addResourceLocations("file:" + uploadDir + "/"); 
    }
}