package com.ecommerce.media.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MediaEvent {

    private String eventType;
    private String mediaId;
    private String productId;
    private String imagePath;
}
