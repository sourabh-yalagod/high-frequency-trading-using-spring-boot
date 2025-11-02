package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.types.Assets;
import org.example.types.OrderSide;
import org.example.types.OrderStatus;
import org.example.types.OrderType;
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
    @Enumerated(value = EnumType.STRING)
    private Assets asset;
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
    @UpdateTimestamp
    private String updateAt;
}
