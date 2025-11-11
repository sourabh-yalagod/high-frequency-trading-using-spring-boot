package cryptoHub.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.*;
import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.TwoFactorAuthRepository;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final UserRepository userRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;

    @GetMapping("/test")
    public ResponseEntity<String> getResponse() {
        return ResponseEntity.status(201).body("Hello world");
    }

    @GetMapping("/request-verification-otp/{userId}")
    public ResponseEntity<AccountVerificationResponseDto> requestOtpForAccountVerification(@PathVariable String userId) throws Exception {
        userService.handleOtpRequestForAccountVerification(userId);
        return ResponseEntity.status(202).body(new AccountVerificationResponseDto("OTP Sent successfully."));
    }

    @PostMapping("/verify-account/{userId}")
    public ResponseEntity<VerifyAccountResponseDto> verifyUserAccount(@RequestBody VerifyAccountRequestDto verifyAccountRequestPayload, @PathVariable String userId) throws Exception {
        TwoFactorAuthEntity twoFactorAuthEntity = userService.verifyUserAccount(userId, verifyAccountRequestPayload.getOtp());

        return ResponseEntity.status(201)
                .body(VerifyAccountResponseDto.builder().message("Account Verified successfully.")
                        .userId(twoFactorAuthEntity.getUser().getId())
                        .build()
                );
    }

    @GetMapping("/{userId}")
    public Optional<UserEntity> userAccount(@PathVariable String userId) {
        return userRepository.findById(userId);
    }

    @GetMapping("/update-balance/{userId}")
    public ResponseEntity<Object> updateUserBalance(@PathVariable String userId) throws JsonProcessingException {
        String cache = redisTemplate.opsForValue().get(userId);
        CacheUserDto userCache = objectMapper.readValue(cache, CacheUserDto.class);
        if (userCache == null) {
            return ResponseEntity.badRequest().body(UpdateBalanceResponse
                    .builder()
                    .status(false)
                    .message("User cache not found...!")
                    .build());
        }
        Optional<UserEntity> user = userRepository.findById(userId);
        if (!user.isPresent()) {
            return ResponseEntity.badRequest().body(UpdateBalanceResponse
                    .builder()
                    .status(false)
                    .message("user not found...!")
                    .build());
        }
        user.get().setAmount(userCache.getAmount());
        return ResponseEntity.ok(userRepository.save(user.get()));
    }

    @PostMapping("/update-username/{userId}")
    public ResponseEntity<CustomResponseDto> updateUsername(@RequestBody UpdateUsernameDto usernameDto, @PathVariable String userId) {
        Optional<UserEntity> user = userRepository.findById(userId);
        if (usernameDto.getUsername() == null) {
            return ResponseEntity
                    .badRequest()
                    .body(CustomResponseDto
                            .builder()
                            .status(false)
                            .message("Username can't be Empty....!")
                            .build());
        }
        if (!user.isPresent()) {
            return ResponseEntity
                    .badRequest()
                    .body(CustomResponseDto
                            .builder()
                            .status(false)
                            .message("user not found...!")
                            .build());
        }
        user.get().setUsername(usernameDto.getUsername());
        userRepository.save(user.get());
        return ResponseEntity.ok(CustomResponseDto.builder().status(true).message("username updated successfully.").build());
    }
}