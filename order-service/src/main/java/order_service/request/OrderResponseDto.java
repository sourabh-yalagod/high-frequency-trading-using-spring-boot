package order_service.request;

import lombok.Data;
import order_service.types.OrderStatus;
import order_service.types.OrderType;

@Data
public class OrderResponseDto {
    private String userId;
    private OrderType side;
    private OrderStatus status;
    private boolean isFilled;
}