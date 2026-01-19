package com.ecommerce.product.event;

import com.ecommerce.product.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventConsumer {

    private final ProductRepository productRepository;

    @KafkaListener(topics = "user-events", groupId = "product-service-group")
    public void handleUserEvent(UserEvent event) {
        log.info("Received user event: {}", event.getEventType());

        if ("USER_DELETED".equals(event.getEventType())) {
            deleteProductsByUserId(event.getUserId());
        }
    }

    private void deleteProductsByUserId(String userId) {
        log.info("Deleting all products for deleted user: {}", userId);
        productRepository.findByUserId(userId).forEach(productRepository::delete);
        log.info("Products deleted for user: {}", userId);
    }
}
