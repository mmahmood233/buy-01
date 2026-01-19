package com.ecommerce.media.exception;

public class MediaNotFoundException extends RuntimeException {

    public MediaNotFoundException(String message) {
        super(message);
    }
}
