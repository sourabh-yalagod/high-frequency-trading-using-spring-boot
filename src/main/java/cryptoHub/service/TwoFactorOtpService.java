package cryptoHub.service;

import cryptoHub.entity.TwoFactorOtpEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.TwoFactorOtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TwoFactorOtpService {

    private final TwoFactorOtpRepository twoFactorOtpRepository;

    public TwoFactorOtpEntity createTwoFactorOtp(Optional<UserEntity> userEntity, String otp) {
        UserEntity user = userEntity.orElseThrow(() -> new RuntimeException("User not found"));
        Optional<TwoFactorOtpEntity> existing = Optional.ofNullable(twoFactorOtpRepository.findByUser(user));

        TwoFactorOtpEntity twoFactorOtpEntity;
        if (existing.isPresent()) {
            // update existing OTP
            twoFactorOtpEntity = existing.get();
            twoFactorOtpEntity.setOtp(otp);
            twoFactorOtpEntity.setJwtToken(user.getRefreshToken());
        } else {
            // create new OTP
            twoFactorOtpEntity = TwoFactorOtpEntity.builder()
                    .user(user)
                    .otp(otp)
                    .jwtToken(user.getRefreshToken())
                    .build();
        }
        return twoFactorOtpRepository.save(twoFactorOtpEntity);
    }


    public TwoFactorOtpEntity findByUserId(String userId) {
        return twoFactorOtpRepository.findByUserId(userId);
    }

    public Optional<TwoFactorOtpEntity> findById(String id) {
        return twoFactorOtpRepository.findById(id);
    }

    public boolean verifyTwoFactorOtp(TwoFactorOtpEntity twoFactorOtpEntity, String otp) {
        return twoFactorOtpEntity.getOtp().equals(otp);
    }

    public void deleteTwoFactorOtp(TwoFactorOtpEntity twoFactorOtpEntity) {
        twoFactorOtpRepository.delete(twoFactorOtpEntity);
        return;
    }
}
