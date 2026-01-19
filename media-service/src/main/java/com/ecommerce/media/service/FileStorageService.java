package com.ecommerce.media.service;

import com.ecommerce.media.config.MediaConfig;
import com.ecommerce.media.exception.FileUploadException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {

    private final MediaConfig mediaConfig;

    public String storeFile(MultipartFile file) {
        validateFile(file);

        String fileName = generateUniqueFileName(file.getOriginalFilename());
        Path uploadPath = createUploadDirectory();
        Path filePath = uploadPath.resolve(fileName);

        try {
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);
            log.info("File stored successfully: {}", fileName);
            return fileName;
        } catch (IOException ex) {
            throw new FileUploadException("Failed to store file: " + fileName, ex);
        }
    }

    public void deleteFile(String fileName) {
        try {
            Path filePath = Paths.get(mediaConfig.getUploadDirectory()).resolve(fileName);
            Files.deleteIfExists(filePath);
            log.info("File deleted successfully: {}", fileName);
        } catch (IOException ex) {
            log.error("Failed to delete file: {}", fileName, ex);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new FileUploadException("File is empty or null");
        }
    }

    private String generateUniqueFileName(String originalFileName) {
        String extension = extractFileExtension(originalFileName);
        return UUID.randomUUID().toString() + extension;
    }

    private String extractFileExtension(String fileName) {
        if (fileName == null || !fileName.contains(".")) {
            return "";
        }
        return fileName.substring(fileName.lastIndexOf("."));
    }

    private Path createUploadDirectory() {
        Path uploadPath = Paths.get(mediaConfig.getUploadDirectory());
        try {
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
                log.info("Upload directory created: {}", uploadPath);
            }
            return uploadPath;
        } catch (IOException ex) {
            throw new FileUploadException("Failed to create upload directory", ex);
        }
    }
}
