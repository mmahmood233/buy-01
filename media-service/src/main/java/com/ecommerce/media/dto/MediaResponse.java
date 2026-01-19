package com.ecommerce.media.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaResponse {

    private String id;
    private String imagePath;
    private String productId;
    private String fileName;
    private String contentType;
    private Long fileSize;
    private String uploadedBy;
    private LocalDateTime createdAt;
}
