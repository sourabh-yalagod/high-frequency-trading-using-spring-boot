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
    private Assets asset;
    private String userId;
    private OrderType orderType;
    private Double price;
    private String callUrl;
    private Double quantity;
    private String margin;
    private OrderStatus status;
    private OrderSide orderSide;
    private String createdAt;

    // Custom constructor (if you want createdAt to be auto-generated)
    public OrderRequestDto(Assets asset, String userId, OrderType orderType, Double price, String callUrl,
                           Double quantity, String margin, OrderStatus status, OrderSide orderSide) {
        this.asset = asset;
        this.userId = userId;
        this.orderType = orderType;
        this.price = price;
        this.callUrl = callUrl;
        this.quantity = quantity;
        this.margin = margin;
        this.status = status;
        this.orderSide = orderSide;
        this.createdAt = LocalDateTime.now().toString();
    }
}
