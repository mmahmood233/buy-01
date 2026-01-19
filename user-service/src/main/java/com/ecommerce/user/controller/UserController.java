package com.ecommerce.user.controller;

import com.ecommerce.user.dto.UpdateUserRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String userId) {
        UserResponse response = userService.getUserById(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserResponse> updateUser(
            @PathVariable String userId,
            @Valid @RequestBody UpdateUserRequest request) {
        UserResponse response = userService.updateUser(userId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> deleteUser(@PathVariable String userId) {
        userService.deleteUser(userId);
        return ResponseEntity.noContent().build();
    }
}
