package com.ecommerce.user.event;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class UserEventProducer {

    private static final String USER_TOPIC = "user-events";

    private final KafkaTemplate<String, UserEvent> kafkaTemplate;

    public void publishUserCreatedEvent(String userId, String email, String role) {
        UserEvent event = UserEvent.builder()
                .eventType("USER_CREATED")
                .userId(userId)
                .email(email)
                .role(role)
                .build();

        kafkaTemplate.send(USER_TOPIC, userId, event);
        log.info("Published USER_CREATED event for user: {}", userId);
    }

    public void publishUserDeletedEvent(String userId) {
        UserEvent event = UserEvent.builder()
                .eventType("USER_DELETED")
                .userId(userId)
                .build();

        kafkaTemplate.send(USER_TOPIC, userId, event);
        log.info("Published USER_DELETED event for user: {}", userId);
    }
}
