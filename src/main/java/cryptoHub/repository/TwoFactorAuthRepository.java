package cryptoHub.repository;

import cryptoHub.entity.TwoFactorAuthEntity;
import cryptoHub.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface TwoFactorAuthRepository extends JpaRepository<TwoFactorAuthEntity, String> {
    @Query("SELECT t FROM TwoFactorAuthEntity t WHERE t.user.id = :userId")
    Optional<TwoFactorAuthEntity> findTwoFactorEntityByUserId(@Param("userId") String userId);
    TwoFactorAuthEntity findByUser(UserEntity user);
}
