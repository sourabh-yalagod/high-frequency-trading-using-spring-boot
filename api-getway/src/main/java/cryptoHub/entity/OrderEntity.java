package cryptoHub.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import cryptoHub.types.OrderSide;
import cryptoHub.types.OrderStatus;
import cryptoHub.types.OrderType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "orders")
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderEntity {
    @Id
    private String id;
    private String userId;
    private String asset;
    @Enumerated(value = EnumType.STRING)
    private OrderType orderType;
    private Double price;
    private Double quantity;
    private Double remainingQuantity;
    private String margin;
    @Enumerated(value = EnumType.STRING)
    private OrderStatus status;
    @Enumerated(value = EnumType.STRING)
    private OrderSide orderSide;
    private String createdAt;
    private Double sl;
    private Double profitLoss;
    private Double tg;
    @UpdateTimestamp
    private String updateAt;
}
