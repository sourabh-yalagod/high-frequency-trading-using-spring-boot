package websocket.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import websocket.types.Assets;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@ToString
public class WebsocketResponse {
    List<OrderDto> bids;
    List<OrderDto> asks;

    public WebsocketResponse(List<OrderDto> buyOrders, List<OrderDto> sellOrders) {
        bids = constructOrderBook(buyOrders, true);
        asks = constructOrderBook(sellOrders, false);
    }

    public List<OrderDto> constructOrderBook(List<OrderDto> orders, boolean isBuyers) {
        if (orders == null || orders.isEmpty()) {
            return Collections.emptyList();
        }

        // Group by price and sum both quantity and remainingQuantity
        Map<Double, OrderDto> aggregated = orders.stream()
                .collect(Collectors.toMap(
                        OrderDto::getPrice,
                        o -> new OrderDto(o.getPrice(), o.getQuantity(), o.getRemainingQuantity(), o.getAsset()),
                        (o1, o2) -> new OrderDto(
                                o1.getPrice(),
                                o1.getQuantity() + o2.getQuantity(),                  // sum quantities
                                o1.getRemainingQuantity() + o2.getRemainingQuantity(), // sum remaining quantities
                                o1.getAsset()
                        )
                ));

        List<OrderDto> result = aggregated.values()
                .stream()
                .sorted(isBuyers
                        ? Comparator.comparingDouble(OrderDto::getPrice).reversed()
                        : Comparator.comparingDouble(OrderDto::getPrice))
                .collect(Collectors.toList());

        return result;
    }
}
