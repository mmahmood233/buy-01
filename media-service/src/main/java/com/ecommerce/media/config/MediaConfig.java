package com.ecommerce.media.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;
import java.util.List;

@Configuration
@Getter
public class MediaConfig {

    @Value("${media.upload.directory}")
    private String uploadDirectory;

    @Value("${media.upload.max-size}")
    private Long maxFileSize;

    @Value("${media.upload.allowed-types}")
    private String allowedTypesString;

    public List<String> getAllowedTypes() {
        return Arrays.asList(allowedTypesString.split(","));
    }
}
