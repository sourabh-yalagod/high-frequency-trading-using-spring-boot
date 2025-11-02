package cryptoHub.repository;

import cryptoHub.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.Repository;

public interface PaymentRepository extends JpaRepository<PaymentEntity, String> {
}