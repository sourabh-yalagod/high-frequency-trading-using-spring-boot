package org.example.entity;

import jakarta.persistence.Column;
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
public class OrderRequestDto {
    private Assets asset;
    private String userId;
    private OrderType orderType;
    private Double price;
    private String callUrl;
    private Double quantity;
    private String margin;
    private OrderStatus status;
    private OrderSide orderSide;

    @CreationTimestamp
    @Column(updatable = false)
    private String createdAt;

    @UpdateTimestamp
    private String updateAt;
}
