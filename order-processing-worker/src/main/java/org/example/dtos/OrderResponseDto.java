package org.example.entity;

import lombok.Data;
import org.example.types.OrderStatus;
import org.example.types.OrderType;

@Data
public class OrderResponseDto {
    private String message;
    private OrderStatus status;
    private boolean isFilled;
}