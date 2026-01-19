package com.ecommerce.media.controller;

import com.ecommerce.media.dto.MediaResponse;
import com.ecommerce.media.service.MediaService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
@RequiredArgsConstructor
public class MediaController {

    private final MediaService mediaService;

    @PostMapping("/upload")
    public ResponseEntity<MediaResponse> uploadMedia(
            @RequestParam("file") MultipartFile file,
            @RequestParam("productId") String productId,
            @RequestHeader("X-User-Id") String userId) {
        MediaResponse response = mediaService.uploadMedia(file, productId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{mediaId}")
    public ResponseEntity<MediaResponse> getMediaById(@PathVariable String mediaId) {
        MediaResponse response = mediaService.getMediaById(mediaId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    public ResponseEntity<List<MediaResponse>> getMediaByProductId(@PathVariable String productId) {
        List<MediaResponse> media = mediaService.getMediaByProductId(productId);
        return ResponseEntity.ok(media);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MediaResponse>> getMediaByUserId(@PathVariable String userId) {
        List<MediaResponse> media = mediaService.getMediaByUserId(userId);
        return ResponseEntity.ok(media);
    }

    @DeleteMapping("/{mediaId}")
    public ResponseEntity<Void> deleteMedia(
            @PathVariable String mediaId,
            @RequestHeader("X-User-Id") String userId) {
        mediaService.deleteMedia(mediaId, userId);
        return ResponseEntity.noContent().build();
    }
}
