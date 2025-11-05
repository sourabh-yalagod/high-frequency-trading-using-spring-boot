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

        Map<Double, Double> aggregated = orders.stream()
                .collect(Collectors.groupingBy(
                        OrderDto::getPrice,
                        Collectors.summingDouble(OrderDto::getQuantity)
                ));

        List<OrderDto> result = aggregated.entrySet().stream()
                .map(entry -> new OrderDto(entry.getKey(), entry.getValue(), orders.getFirst().getAsset()))
                .collect(Collectors.toList());

        if (isBuyers) {
            result.sort(Comparator.comparingDouble(OrderDto::getPrice).reversed());
        } else {
            result.sort(Comparator.comparingDouble(OrderDto::getPrice));
        }

        return result;
    }
}
