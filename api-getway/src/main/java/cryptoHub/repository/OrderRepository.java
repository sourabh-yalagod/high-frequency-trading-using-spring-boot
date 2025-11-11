package cryptoHub.repository;

import cryptoHub.entity.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity,String> {
    @Query("SELECT o FROM OrderEntity o WHERE o.userId = :userId AND (o.status = 'PENDING' OR o.status = 'OPEN')")
    List<OrderEntity> getPendingAndOpenOrdersByUserId(@Param("userId") String userId);

    @Query("SELECT o FROM OrderEntity o WHERE o.userId = :userId AND (o.status = 'CLOSED' OR o.status = 'REJECTED')")
    List<OrderEntity> getClosedAndRejectedOrders(@Param("userId") String userId);
}
