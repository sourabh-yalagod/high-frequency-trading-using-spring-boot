package cryptoHub.controller;

import cryptoHub.entity.TwoFactorOtpEntity;
import cryptoHub.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/test")
    public ResponseEntity<TwoFactorOtpEntity> getResponse() {
        TwoFactorOtpEntity.builder().otp("90").build();
        return ResponseEntity.status(201).body(TwoFactorOtpEntity.builder().otp("90").build());
    }

    @GetMapping("/verify-account/{userId}")
    public TwoFactorOtpEntity verifyUserAccount(@PathVariable String userId) throws Exception {
        TwoFactorOtpEntity twoFactorOtpEntity = userService.verifyUserAccount(userId);
        System.out.println(twoFactorOtpEntity);
        return ResponseEntity.status(201).body(twoFactorOtpEntity).getBody();
    }
}
