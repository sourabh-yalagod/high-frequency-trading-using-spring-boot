package cryptoHub.service;

import ch.qos.logback.core.encoder.EchoEncoder;
import cryptoHub.entity.TwoFactorOtpEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final TwoFactorOtpService twoFactorOtpService;
    public TwoFactorOtpEntity verifyUserAccount(String userId) throws Exception {
        Optional<UserEntity> user = userRepository.findById(userId);
        return twoFactorOtpService.createTwoFactorOtp(user,"90");
    }
}
