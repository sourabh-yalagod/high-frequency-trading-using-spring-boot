package cryptoHub.repository;

import cryptoHub.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<UserEntity, String> {
    UserEntity findUserByUsernameOrEmail(String fullname,String email);
    UserEntity findUserByEmail(String email);

}
