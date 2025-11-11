package org.example.dtos;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.example.types.OrderSide;
import org.example.types.OrderStatus;
import org.example.types.OrderType;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderRequestDto {
    private String id;
    private String asset;
    private String userId;
    private OrderType orderType;
    private Double price;
    private String callUrl;
    private Double quantity;
    private Double remainingQuantity;
    private Double margin;
    private OrderStatus status;
    private OrderSide orderSide;
    private String createdAt;
}