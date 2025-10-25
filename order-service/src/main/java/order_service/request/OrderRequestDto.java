package order_service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import order_service.types.Assets;
import order_service.types.OrderStatus;
import order_service.types.OrderType;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDto {
    private Assets asset;
    private String userId;
    private OrderType side;
    private double amount;
    private String callUrl;
    private String quantity;
    private String margin;
    private OrderStatus status;
}