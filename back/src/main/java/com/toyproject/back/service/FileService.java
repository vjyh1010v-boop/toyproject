package com.toyproject.back.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.util.UUID;

@Service
public class FileService {

    @Value("${file.upload-dir:C:/uploads/}")
    private String uploadDir;

    /**
     * 파일을 로컬 디스크에 물리적으로 저장하고 가상 접근 URL을 반환합니다.
     */
    public String uploadImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            File folder = new File(uploadDir);
            if (!folder.exists()) {
                folder.mkdirs();
            }

            String originalFileName = file.getOriginalFilename();
            String extension = originalFileName.substring(originalFileName.lastIndexOf("."));
            String savedFileName = UUID.randomUUID().toString() + extension;

            File destination = new File(uploadDir + savedFileName);
            file.transferTo(destination);

            // 프론트엔드가 접근할 수 있는 가상 경로 리턴
            return "/images/" + savedFileName;

        } catch (IOException e) {
            throw new RuntimeException("파일 업로드 중 오류가 발생했습니다.", e);
        }
    }
}