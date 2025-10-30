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
import org.hibernate.annotations.CreationTimestamp;
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
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;
    private String orderId;
    private String userId;
    private Assets asset;
    private OrderType orderType;
    private Double price;
    private Double quantity;
    private Double remainingQuantity;
    private String margin;
    private OrderStatus status;
    private OrderSide orderSide;
    private String createdAt;
    @UpdateTimestamp
    private String updateAt;
}
