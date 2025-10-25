package order_service.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.NonNull;
import order_service.types.Assets;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import org.springframework.data.annotation.CreatedDate;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class OrderRequestDto {
    private Assets asset;
    private String userId;
    private OrderType orderType;
    private Double price;
    private String callUrl;
    private Double quantity;
    private String margin;
    private OrderStatus status;
    private OrderSide side;
    private String createdAt;
}