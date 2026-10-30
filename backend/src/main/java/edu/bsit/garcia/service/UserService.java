package edu.bsit.garcia.service;

import edu.bsit.garcia.dto.DashboardResponse;
import edu.bsit.garcia.dto.LoginRequest;
import edu.bsit.garcia.dto.LoginResponse;
import edu.bsit.garcia.dto.RegisterRequest;
import edu.bsit.garcia.dto.UpdateProfileRequest;
import edu.bsit.garcia.dto.UserResponse;
import edu.bsit.garcia.exception.AuthException;
import edu.bsit.garcia.exception.BadRequestException;
import edu.bsit.garcia.exception.ForbiddenException;
import edu.bsit.garcia.model.User;
import edu.bsit.garcia.repository.UserRepository;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Base64;
import java.util.HexFormat;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Business rules for accounts, profile data, and simple in-memory bearer sessions. */
@Service
@Transactional
public class UserService {
    private static final int MAX_PROFILE_PICTURE_BYTES = 1024 * 1024;
    private static final String JPEG_PREFIX = "data:image/jpeg;base64,";
    private static final String PNG_PREFIX = "data:image/png;base64,";
    private final UserRepository userRepository;
    private final ConcurrentHashMap<String, Long> sessions = new ConcurrentHashMap<>();

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new IllegalArgumentException("Email already used");
        }
        User user = new User();
        user.setFullName(request.fullName().trim());
        user.setEmail(request.email().trim());
        user.setPassword(hashPassword(request.password()));
        user.setRole("USER");
        return toResponse(userRepository.save(user), false);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email().trim())
                .filter(found -> hashPassword(request.password()).equals(found.getPassword()))
                .orElseThrow(() -> new AuthException("Invalid credentials"));
        String token = UUID.randomUUID().toString();
        sessions.put(token, user.getId());
        // Keep login responses small; the dashboard endpoint supplies the picture.
        return new LoginResponse(token, toResponse(user, false));
    }

    @Transactional(readOnly = true)
    public User authenticate(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) {
            throw new AuthException("Please log in");
        }
        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7).trim()
                : authorizationHeader.trim();
        Long userId = sessions.get(token);
        if (userId == null) {
            throw new AuthException("Session expired");
        }
        return userRepository.findById(userId).orElseGet(() -> {
            sessions.remove(token);
            throw new AuthException("Session expired");
        });
    }

    public void logout(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.isBlank()) return;
        String token = authorizationHeader.startsWith("Bearer ")
                ? authorizationHeader.substring(7).trim()
                : authorizationHeader.trim();
        sessions.remove(token);
    }

    @Transactional(readOnly = true)
    public DashboardResponse dashboard(User user) {
        return new DashboardResponse(user.getFullName(), user.getEmail(), user.getRole(),
                user.getAddress(), user.getPhone(), user.getProfilePicture(),
                user.getCreatedAt(), userRepository.count());
    }

    public void requireRole(User user, String role) {
        if (!role.equals(user.getRole())) throw new ForbiddenException("Access denied");
    }

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        // The administrator table does not need potentially large image data.
        return userRepository.findAll().stream().map(user -> toResponse(user, false)).toList();
    }

    public UserResponse updateProfile(User user, UpdateProfileRequest request) {
        String profilePicture = request.profilePicture();
        if (profilePicture != null && !profilePicture.isBlank()) {
            validateProfilePicture(profilePicture);
            user.setProfilePicture(profilePicture);
        }
        user.setFullName(request.fullName().trim());
        user.setAddress(normalizeOptional(request.address()));
        user.setPhone(normalizeOptional(request.phone()));
        return toResponse(userRepository.save(user), true);
    }

    private static String normalizeOptional(String value) {
        if (value == null || value.isBlank()) return null;
        return value.trim();
    }

    private static void validateProfilePicture(String dataUrl) {
        String payload;
        boolean jpeg;
        if (dataUrl.startsWith(JPEG_PREFIX)) {
            payload = dataUrl.substring(JPEG_PREFIX.length());
            jpeg = true;
        } else if (dataUrl.startsWith(PNG_PREFIX)) {
            payload = dataUrl.substring(PNG_PREFIX.length());
            jpeg = false;
        } else {
            throw new BadRequestException("Profile picture must be a JPEG or PNG data URL");
        }

        final byte[] imageBytes;
        try {
            imageBytes = Base64.getDecoder().decode(payload);
        } catch (IllegalArgumentException exception) {
            throw new BadRequestException("Profile picture contains invalid Base64 data");
        }
        if (imageBytes.length > MAX_PROFILE_PICTURE_BYTES) {
            throw new BadRequestException("Profile picture must be no larger than 1 MB");
        }
        if (!hasExpectedImageSignature(imageBytes, jpeg)) {
            throw new BadRequestException("Profile picture content does not match its JPEG or PNG type");
        }
    }

    private static boolean hasExpectedImageSignature(byte[] bytes, boolean jpeg) {
        if (jpeg) {
            return bytes.length >= 3
                    && (bytes[0] & 0xff) == 0xff
                    && (bytes[1] & 0xff) == 0xd8
                    && (bytes[2] & 0xff) == 0xff;
        }
        byte[] pngSignature = {(byte) 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a};
        if (bytes.length < pngSignature.length) return false;
        for (int i = 0; i < pngSignature.length; i++) {
            if (bytes[i] != pngSignature[i]) return false;
        }
        return true;
    }

    /** SHA-256 is used to match the student assignment; use a password KDF in production. */
    public static String hashPassword(String password) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(password.getBytes(java.nio.charset.StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable", exception);
        }
    }

    private static UserResponse toResponse(User user, boolean includeProfilePicture) {
        return new UserResponse(user.getId(), user.getFullName(), user.getEmail(), user.getRole(),
                user.getAddress(), user.getPhone(), includeProfilePicture ? user.getProfilePicture() : null,
                user.getCreatedAt());
    }
}
