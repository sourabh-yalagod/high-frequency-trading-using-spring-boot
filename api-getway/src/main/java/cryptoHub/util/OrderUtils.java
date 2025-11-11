package cryptoHub.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.OrderRequestDto;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Component
public class OrderUtils {
    ObjectMapper objectMapper = new ObjectMapper();

    public List<OrderRequestDto> mapOrders(Set<Object> rawOrders) {
        // cast objects back to OrderRequestDto
        return rawOrders.stream().map(obj -> (OrderRequestDto) obj).collect(Collectors.toList());
    }

    public List<OrderRequestDto> parseOrders(Set<String> rawOrders) {
        if (rawOrders == null || rawOrders.isEmpty()) {
            return new ArrayList<>();
        }

        List<OrderRequestDto> orders = new ArrayList<>();
        for (String orderJson : rawOrders) {
            try {
                OrderRequestDto order = objectMapper.readValue(orderJson, OrderRequestDto.class);
                orders.add(order);
            } catch (JsonProcessingException e) {
                System.out.println("Failed to parse order: {}" + e.getMessage());
            }
        }
        return orders;
    }
}
