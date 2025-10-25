package cryptoHub.service;

import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.TwoFactorAuthRepository;
import cryptoHub.types.CommunicationChannel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TwoFactorAuthService {

    private final TwoFactorAuthRepository twoFactorAuthRepository;

    public TwoFactorAuthEntity createTwoFactorOtp(Optional<TwoFactorAuthEntity> twoFactorAuthEntity, String otp) throws Exception {
        if (!twoFactorAuthEntity.isPresent()) throw new Exception("Two factor entity for this user not exist...!");
        TwoFactorAuthEntity twoFactorAuth = twoFactorAuthEntity.get();
        if (twoFactorAuth.getOtp().toString() != otp.toString()) {
            throw new Exception("OTP mismatch...!\n Account verification failed...!");
        }
        twoFactorAuth.setVerified(true);
        twoFactorAuth.setChannel(CommunicationChannel.EMAIL);
        return twoFactorAuthRepository.save(twoFactorAuth);
    }


    public Optional<TwoFactorAuthEntity> findTwoFactorEntityByUserId(String userId) {
        return twoFactorAuthRepository.findTwoFactorEntityByUserId(userId);
    }

    public Optional<TwoFactorAuthEntity> findById(String id) {
        return twoFactorAuthRepository.findById(id);
    }

    public boolean verifyTwoFactorOtp(TwoFactorAuthEntity twoFactorAuthEntity, String otp) {
        return twoFactorAuthEntity.getOtp().equals(otp);
    }

    public void deleteTwoFactorOtp(TwoFactorAuthEntity twoFactorAuthEntity) {
        twoFactorAuthRepository.delete(twoFactorAuthEntity);
        return;
    }
}
