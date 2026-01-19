package com.ecommerce.media.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class MediaEventProducer {

    private static final String MEDIA_TOPIC = "media-events";

    private final KafkaTemplate<String, MediaEvent> kafkaTemplate;

    public void publishMediaUploadedEvent(String mediaId, String productId, String imagePath) {
        MediaEvent event = MediaEvent.builder()
                .eventType("MEDIA_UPLOADED")
                .mediaId(mediaId)
                .productId(productId)
                .imagePath(imagePath)
                .build();

        kafkaTemplate.send(MEDIA_TOPIC, mediaId, event);
        log.info("Published MEDIA_UPLOADED event for media: {}", mediaId);
    }

    public void publishMediaDeletedEvent(String mediaId, String productId) {
        MediaEvent event = MediaEvent.builder()
                .eventType("MEDIA_DELETED")
                .mediaId(mediaId)
                .productId(productId)
                .build();

        kafkaTemplate.send(MEDIA_TOPIC, mediaId, event);
        log.info("Published MEDIA_DELETED event for media: {}", mediaId);
    }
}
