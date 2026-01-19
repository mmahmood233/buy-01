package com.ecommerce.media.event;

import com.ecommerce.media.repository.MediaRepository;
import com.ecommerce.media.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventConsumer {

    private final MediaRepository mediaRepository;
    private final FileStorageService fileStorageService;

    @KafkaListener(topics = "product-events", groupId = "media-service-group")
    public void handleProductEvent(ProductEvent event) {
        log.info("Received product event: {}", event.getEventType());

        if ("PRODUCT_DELETED".equals(event.getEventType())) {
            deleteMediaByProductId(event.getProductId());
        }
    }

    private void deleteMediaByProductId(String productId) {
        log.info("Deleting all media for deleted product: {}", productId);
        
        mediaRepository.findByProductId(productId).forEach(media -> {
            fileStorageService.deleteFile(media.getFileName());
            mediaRepository.delete(media);
        });
        
        log.info("Media deleted for product: {}", productId);
    }
}
