package cryptoHub.service;

import cryptoHub.dto.OrderDto;
import cryptoHub.dto.OrderRequestDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@ToString
public class OrderBookService {
    List<OrderDto> bids;
    List<OrderDto> asks;

    public OrderBookService(List<OrderRequestDto> buyOrders, List<OrderRequestDto> sellOrders) {
        bids = constructOrderBook(buyOrders, true);
        asks = constructOrderBook(sellOrders, false);
    }

    public List<OrderDto> constructOrderBook(List<OrderRequestDto> orders, boolean isBuyers) {
        if (orders == null || orders.isEmpty()) {
            return null;
        }

        Map<Double, Double> aggregated = orders.stream()
                .collect(Collectors.groupingBy(
                        OrderRequestDto::getPrice,
                        Collectors.summingDouble(OrderRequestDto::getQuantity)
                ));

        List<OrderDto> result = aggregated.entrySet().stream()
                .map(entry -> OrderDto.builder()
                        .price(entry.getKey())
                        .quantity(entry.getValue())
                        .asset(orders.getFirst().getAsset()).build())
                .collect(Collectors.toList());

        if (isBuyers) {
            result.sort(Comparator.comparingDouble(OrderDto::getPrice).reversed());
        } else {
            result.sort(Comparator.comparingDouble(OrderDto::getPrice));
        }

        return result;
    }
}

