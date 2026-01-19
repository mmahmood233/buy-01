package com.ecommerce.media.mapper;

import com.ecommerce.media.dto.MediaResponse;
import com.ecommerce.media.model.Media;
import org.springframework.stereotype.Component;

@Component
public class MediaMapper {

    public MediaResponse toMediaResponse(Media media) {
        return MediaResponse.builder()
                .id(media.getId())
                .imagePath(media.getImagePath())
                .productId(media.getProductId())
                .fileName(media.getFileName())
                .contentType(media.getContentType())
                .fileSize(media.getFileSize())
                .uploadedBy(media.getUploadedBy())
                .createdAt(media.getCreatedAt())
                .build();
    }
}
