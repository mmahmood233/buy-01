package com.ecommerce.user.service;

import com.ecommerce.user.dto.AuthResponse;
import com.ecommerce.user.dto.LoginRequest;
import com.ecommerce.user.dto.RegisterRequest;
import com.ecommerce.user.dto.UpdateUserRequest;
import com.ecommerce.user.dto.UserResponse;
import com.ecommerce.user.exception.InvalidCredentialsException;
import com.ecommerce.user.exception.UserAlreadyExistsException;
import com.ecommerce.user.exception.UserNotFoundException;
import com.ecommerce.user.mapper.UserMapper;
import com.ecommerce.user.model.User;
import com.ecommerce.user.repository.UserRepository;
import com.ecommerce.user.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    public AuthResponse register(RegisterRequest request) {
        log.info("Registering user with email: {}", request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("User with email " + request.getEmail() + " already exists");
        }

        User user = buildUserFromRequest(request);
        User savedUser = userRepository.save(user);

        log.info("User registered successfully with ID: {}", savedUser.getId());

        String token = generateTokenForUser(savedUser);
        return userMapper.toAuthResponse(savedUser, token);
    }

    public AuthResponse login(LoginRequest request) {
        log.info("Login attempt for email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        log.info("User logged in successfully: {}", user.getId());

        String token = generateTokenForUser(user);
        return userMapper.toAuthResponse(user, token);
    }

    public UserResponse getUserById(String userId) {
        log.info("Fetching user with ID: {}", userId);

        User user = findUserById(userId);
        return userMapper.toUserResponse(user);
    }

    public UserResponse updateUser(String userId, UpdateUserRequest request) {
        log.info("Updating user with ID: {}", userId);

        User user = findUserById(userId);

        if (request.getName() != null) {
            user.setName(request.getName());
        }

        if (request.getAvatar() != null) {
            user.setAvatar(request.getAvatar());
        }

        user.setUpdatedAt(LocalDateTime.now());
        User updatedUser = userRepository.save(user);

        log.info("User updated successfully: {}", updatedUser.getId());

        return userMapper.toUserResponse(updatedUser);
    }

    public void deleteUser(String userId) {
        log.info("Deleting user with ID: {}", userId);

        User user = findUserById(userId);
        userRepository.delete(user);

        log.info("User deleted successfully: {}", userId);
    }

    private User buildUserFromRequest(RegisterRequest request) {
        return User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(request.getRole())
                .avatar(request.getAvatar())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    private User findUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
    }

    private String generateTokenForUser(User user) {
        return jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
    }
}
