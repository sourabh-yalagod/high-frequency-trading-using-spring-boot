package order_service.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import order_service.types.Assets;
import order_service.types.OrderStatus;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WebSocketResponseDto {
    private String message;
    private boolean isLocked;
    private String UserId;
    private Assets assets;
    private Double price;
    private Double quantity;
    private OrderStatus orderStatus;
}
