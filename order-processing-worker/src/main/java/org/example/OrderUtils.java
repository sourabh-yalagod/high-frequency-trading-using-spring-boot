package org.example;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dtos.OrderRequestDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class OrderUtils {
    public static RedisTemplate<String, Object> redisTemplate = null;

    public OrderUtils(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    private static final RestClient restClient = RestClient.builder().build();

    private static final ObjectMapper mapper = new ObjectMapper();

    public static void webHookResponse(OrderRequestDto order) {
        try {
            String callUrl = order.getCallUrl();
            String payload = mapper.writeValueAsString(order);

            System.out.println("Sending webhook to: " + callUrl);

            // create RestClient with timeouts manually via builder
            RestClient restClient = RestClient.builder()
                    .baseUrl(callUrl)
                    .build();

            ResponseEntity<Void> response = restClient
                    .post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(payload)
                    .retrieve()
                    .toBodilessEntity();

            System.out.println("Webhook sent successfully with status: " + response.getStatusCode());

        } catch (RestClientException e) {
            System.err.println("Webhook HTTP error: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Webhook general error: " + e.getMessage());
            e.printStackTrace();
        }
    }

    public static void cacheData(String key, List<OrderRequestDto> ordersList) {
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

    public static List<OrderRequestDto> mapOrders(Set<Object> rawOrders) {
        ObjectMapper objectMapper = new ObjectMapper();
        return rawOrders.stream().map(obj -> objectMapper.convertValue(obj, OrderRequestDto.class)).collect(Collectors.toList());
    }
}
