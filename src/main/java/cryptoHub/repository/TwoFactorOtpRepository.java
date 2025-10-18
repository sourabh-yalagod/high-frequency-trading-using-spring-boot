package cryptoHub.repository;

import cryptoHub.entity.TwoFactorOtpEntity;
import cryptoHub.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TwoFactorOtpRepository extends JpaRepository<TwoFactorOtpEntity, String> {
    TwoFactorOtpEntity findByUser(UserEntity userId);

    TwoFactorOtpEntity findByUserId(String userId);
}