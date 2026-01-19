package com.ecommerce.media.service;

import com.ecommerce.media.dto.MediaResponse;
import com.ecommerce.media.exception.MediaNotFoundException;
import com.ecommerce.media.mapper.MediaMapper;
import com.ecommerce.media.model.Media;
import com.ecommerce.media.repository.MediaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MediaService {

    private final MediaRepository mediaRepository;
    private final MediaMapper mediaMapper;
    private final FileStorageService fileStorageService;
    private final MediaValidationService mediaValidationService;

    public MediaResponse uploadMedia(MultipartFile file, String productId, String userId) {
        log.info("Uploading media for product: {} by user: {}", productId, userId);

        mediaValidationService.validateMediaFile(file);

        String fileName = fileStorageService.storeFile(file);

        Media media = buildMediaFromFile(file, fileName, productId, userId);
        Media savedMedia = mediaRepository.save(media);

        log.info("Media uploaded successfully with ID: {}", savedMedia.getId());

        return mediaMapper.toMediaResponse(savedMedia);
    }

    public MediaResponse getMediaById(String mediaId) {
        log.info("Fetching media with ID: {}", mediaId);

        Media media = findMediaById(mediaId);
        return mediaMapper.toMediaResponse(media);
    }

    public List<MediaResponse> getMediaByProductId(String productId) {
        log.info("Fetching media for product: {}", productId);

        return mediaRepository.findByProductId(productId).stream()
                .map(mediaMapper::toMediaResponse)
                .collect(Collectors.toList());
    }

    public List<MediaResponse> getMediaByUserId(String userId) {
        log.info("Fetching media uploaded by user: {}", userId);

        return mediaRepository.findByUploadedBy(userId).stream()
                .map(mediaMapper::toMediaResponse)
                .collect(Collectors.toList());
    }

    public void deleteMedia(String mediaId, String userId) {
        log.info("Deleting media: {} by user: {}", mediaId, userId);

        Media media = findMediaById(mediaId);
        
        fileStorageService.deleteFile(media.getFileName());
        mediaRepository.delete(media);

        log.info("Media deleted successfully: {}", mediaId);
    }

    private Media buildMediaFromFile(MultipartFile file, String fileName, String productId, String userId) {
        return Media.builder()
                .imagePath("/uploads/" + fileName)
                .productId(productId)
                .fileName(fileName)
                .contentType(file.getContentType())
                .fileSize(file.getSize())
                .uploadedBy(userId)
                .createdAt(LocalDateTime.now())
                .build();
    }

    private Media findMediaById(String mediaId) {
        return mediaRepository.findById(mediaId)
                .orElseThrow(() -> new MediaNotFoundException("Media not found with ID: " + mediaId));
    }
}
