package com.ecommerce.product.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProductEventProducer {

    private static final String PRODUCT_TOPIC = "product-events";

    private final KafkaTemplate<String, ProductEvent> kafkaTemplate;

    public void publishProductCreatedEvent(String productId, String userId, String productName) {
        ProductEvent event = ProductEvent.builder()
                .eventType("PRODUCT_CREATED")
                .productId(productId)
                .userId(userId)
                .productName(productName)
                .build();

        kafkaTemplate.send(PRODUCT_TOPIC, productId, event);
        log.info("Published PRODUCT_CREATED event for product: {}", productId);
    }

    public void publishProductDeletedEvent(String productId, String userId) {
        ProductEvent event = ProductEvent.builder()
                .eventType("PRODUCT_DELETED")
                .productId(productId)
                .userId(userId)
                .build();

        kafkaTemplate.send(PRODUCT_TOPIC, productId, event);
        log.info("Published PRODUCT_DELETED event for product: {}", productId);
    }
}
