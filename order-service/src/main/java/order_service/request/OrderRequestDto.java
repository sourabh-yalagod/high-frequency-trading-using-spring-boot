package order_service.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import order_service.types.Assets;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderRequestDto {
    private String id;
    private Assets asset;
    private String userId;
    private OrderType orderType;
    private Double price;
    private String callUrl;
    private Double quantity;
    private Double remainingQuantity;
    private String margin;
    private OrderStatus status;
    private OrderSide orderSide;
    private String createdAt;
}
