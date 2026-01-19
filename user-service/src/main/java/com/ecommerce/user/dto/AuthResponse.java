package com.ecommerce.user.dto;

import com.ecommerce.user.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {

    private String token;
    private String userId;
    private String name;
    private String email;
    private UserRole role;
    private String avatar;
}
