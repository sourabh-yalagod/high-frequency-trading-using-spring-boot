package order_service.utils;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.response.WebSocketResponseDto;
import order_service.request.OrderRequestDto;
import order_service.types.OrderStatus;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class OrderUtils {

    public final RedisTemplate<String, Object> redisTemplate;

    public void webHookResponse(String callBackUrl, WebSocketResponseDto webSocketResponseDto) {
        CompletableFuture.runAsync(() -> {
            try {
                RestClient restClient = RestClient.create();
                String payload = new ObjectMapper().writeValueAsString(webSocketResponseDto);
                restClient.post().uri(callBackUrl).contentType(MediaType.APPLICATION_JSON).body(payload).retrieve().toBodilessEntity();
            } catch (Exception e) {
                System.err.println("Failed to send async webhook: " + e.getMessage());
            }
        });
    }

    public void cacheData(String key, List<OrderRequestDto> ordersList) {
        if (ordersList == null || ordersList.isEmpty()) {
            redisTemplate.delete(key);
            return;
        }

        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        Set<ZSetOperations.TypedTuple<Object>> orderTuples = ordersList.stream()
                .filter(order -> order != null && order.getPrice() != null)
                .map(order -> new ZSetOperations.TypedTuple<Object>() {
                    @Override
                    public Object getValue() {
                        if (order.getId() == null) {
                            order.setId(UUID.randomUUID().toString());
                        }
                        return order;
                    }

                    @Override
                    public Double getScore() {
                        return order.getPrice();
                    }

                    @Override
                    public int compareTo(ZSetOperations.TypedTuple<Object> o) {
                        return Double.compare(getScore(), o.getScore());
                    }
                }).collect(Collectors.toCollection(LinkedHashSet::new));

        if (orderTuples.isEmpty()) {
            redisTemplate.delete(key);
            return;
        }

        redisTemplate.delete(key);
        zSetOps.add(key, orderTuples);
    }

    public List<OrderRequestDto> mapOrders(Set<Object> rawOrders) {
        // cast objects back to OrderRequestDto
        return rawOrders.stream().map(obj -> (OrderRequestDto) obj).collect(Collectors.toList());
    }

    public WebSocketResponseDto customWebSocketResponse(OrderRequestDto order, String message, boolean isLocked, OrderStatus orderStatus) {
        return WebSocketResponseDto.builder()
                .price(order.getPrice())
                .quantity(order.getQuantity())
                .message(message)
                .assets(order.getAsset())
                .UserId(order.getUserId())
                .orderStatus(orderStatus)
                .isLocked(isLocked)
                .build();
    }
}
