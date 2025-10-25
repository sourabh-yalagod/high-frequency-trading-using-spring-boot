package cryptoHub.service;

import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.TwoFactorAuthRepository;
import cryptoHub.repository.UserRepository;
import cryptoHub.util.AppUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final TwoFactorAuthService twoFactorAuthService;
    private final TwoFactorAuthRepository twoFactorAuthRepository;
    private final EmailService emailService;

    public TwoFactorAuthEntity handleOtpRequestForAccountVerification(String userId) throws Exception {
        Optional<UserEntity> user = Optional.ofNullable(userRepository.findById(userId).orElseThrow(() ->
                new Exception("User not Found with this UserId...!")
        ));
        String otp = AppUtils.generateOTP();
        user.get().getTwoFactorAuthEntity().setOtp(otp);
        user.get().getTwoFactorAuthEntity().setOtp(otp);
        emailService.sendEmailForAccountVerification(user.get().getEmail(), otp);
        userRepository.save(user.get());
        return user.get().getTwoFactorAuthEntity();
    }

    public Optional<UserEntity> findUserById(String userId) {
        return userRepository.findById(userId);
    }

    public TwoFactorAuthEntity verifyUserAccount(String userId, String otp) throws Exception {
        Optional<UserEntity> user = Optional.ofNullable(
                userRepository.findById(userId)
                        .orElseThrow(() -> new Exception("OTP sending for account verification failed....!")));

        if (!user.get().getTwoFactorAuthEntity().getOtp().equals(otp)) {
            throw new Exception("Invalid OTP....!");
        }
        user.get().getTwoFactorAuthEntity().setVerified(true);
        userRepository.save(user.get());
        return user.get().getTwoFactorAuthEntity();
    }

}
