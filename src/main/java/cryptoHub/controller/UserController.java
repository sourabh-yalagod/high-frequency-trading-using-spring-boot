package cryptoHub.controller;

import cryptoHub.dto.AccountVerificationResponseDto;
import cryptoHub.dto.VerifyAccountRequestDto;
import cryptoHub.dto.VerifyAccountResponseDto;
import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.TwoFactorAuthRepository;
import cryptoHub.service.UserService;
import cryptoHub.util.AppUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;
    private final TwoFactorAuthRepository twoFactorAuthRepository;

    @GetMapping("/test")
    public ResponseEntity<String> getResponse() {
        return ResponseEntity.status(201).body("Hello world");
    }

    @GetMapping("/request-verification-otp/{userId}")
    public ResponseEntity<AccountVerificationResponseDto> requestOtpForAccountVerification(@PathVariable String userId) throws Exception {
        Optional<TwoFactorAuthEntity> twoFactorAuthEntity = Optional.ofNullable(twoFactorAuthRepository.findTwoFactorEntityByUserId(userId).orElseThrow(() -> new Exception("OTP sending for account verification failed....!")));
        String otp = AppUtils.generateOTP();
        twoFactorAuthEntity.get().setOtp(otp);
        twoFactorAuthRepository.save(twoFactorAuthEntity.get());
        return ResponseEntity.status(202).body(new AccountVerificationResponseDto("OTP Sent successfully."));
    }

    @PostMapping("/verify-account/{userId}")
    public ResponseEntity<VerifyAccountResponseDto> verifyUserAccount(@RequestBody VerifyAccountRequestDto verifyAccountRequestPayload) throws Exception {
        Optional<TwoFactorAuthEntity> twoFactorAuthEntity = Optional.ofNullable(
                twoFactorAuthRepository.findTwoFactorEntityByUserId(verifyAccountRequestPayload.getUserId())
                        .orElseThrow(() -> new Exception("OTP sending for account verification failed....!")));

        if (!twoFactorAuthEntity.get().getOtp().equals(verifyAccountRequestPayload.getOtp())) {
            throw new Exception("Invalid OTP....!");
        }
        twoFactorAuthEntity.get().setVerified(true);
        twoFactorAuthRepository.save(twoFactorAuthEntity.get());
        return ResponseEntity.status(201)
                .body(VerifyAccountResponseDto.builder().message("Account Verified successfully.")
                        .userId(twoFactorAuthEntity.get().getUser().getId())
                        .build()
                );
    }

    @GetMapping("/{userId}")
    public Optional<TwoFactorAuthEntity> userAccount(@PathVariable String userId) throws Exception {
        return twoFactorAuthRepository.findTwoFactorEntityByUserId(userId);
    }
}