package org.example.dtos;

import lombok.Data;
import org.example.types.OrderStatus;

@Data
public class OrderResponseDto {
    private String message;
    private OrderStatus status;
    private boolean isFilled;
}