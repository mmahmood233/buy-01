package com.ecommerce.media.service;

import com.ecommerce.media.config.MediaConfig;
import com.ecommerce.media.exception.FileSizeExceededException;
import com.ecommerce.media.exception.InvalidFileTypeException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaValidationService {

    private final MediaConfig mediaConfig;

    private static final long MAX_FILE_SIZE = 2097152L;

    public void validateMediaFile(MultipartFile file) {
        validateFileSize(file);
        validateFileType(file);
    }

    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            log.warn("File size exceeds limit: {} bytes", file.getSize());
            throw new FileSizeExceededException(
                    String.format("File size exceeds the maximum allowed limit of 2MB. File size: %d bytes", 
                            file.getSize())
            );
        }
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        
        if (contentType == null || !isValidImageType(contentType)) {
            log.warn("Invalid file type: {}", contentType);
            throw new InvalidFileTypeException(
                    String.format("Invalid file type: %s. Allowed types: image/jpeg, image/png, image/gif, image/webp", 
                            contentType)
            );
        }
    }

    private boolean isValidImageType(String contentType) {
        return mediaConfig.getAllowedTypes().contains(contentType);
    }
}
