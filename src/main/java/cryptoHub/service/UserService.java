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

    public TwoFactorAuthEntity verifyUserAccount(String userId,String otp) throws Exception {
        Optional<TwoFactorAuthEntity> twoFactorAuthEntity = twoFactorAuthRepository.findById(userId);
        return twoFactorAuthService.createTwoFactorOtp(twoFactorAuthEntity, "90");
    }

    public Optional<UserEntity> findUserById(String userId) {
        return userRepository.findById(userId);
    }

    public TwoFactorAuthEntity handleOtpRequestForAccountVerification(String userId) throws Exception {
        TwoFactorAuthEntity twoFactorAuthEntity = twoFactorAuthRepository.findTwoFactorEntityByUserId(userId)
                .orElseThrow(() -> new Exception("User not found!"));
        System.out.println("twoFactorAuthEntity : " + twoFactorAuthEntity);
        String otp = AppUtils.generateOTP();
        twoFactorAuthEntity.setOtp(otp);
        return twoFactorAuthRepository.save(twoFactorAuthEntity);
    }

}
