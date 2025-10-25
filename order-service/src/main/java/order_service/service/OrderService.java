package order_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import order_service.types.OrderSide;
import order_service.types.OrderType;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final ObjectMapper mapper = new ObjectMapper();
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String BTC_BUY_ORDER_KEY = "btc:buy:orders";
    private static final String BTC_SELL_ORDER_KEY = "btc:sell:orders";

    public void process(OrderRequestDto order) throws Exception {
        System.out.println(order.toString());
        if (order.getOrderType().equals(OrderType.BUY)) {
            List<OrderRequestDto> buyTransaction = processBuyOrder(order);
            System.out.println("BuyTransaction : " + buyTransaction);
        }
        if (order.getOrderType().equals(OrderType.SELL)) {
            List<OrderRequestDto> sellTransaction = processSellOrder(order);
            System.out.println("SellTransaction : " + sellTransaction);
        }
    }

    private List<OrderRequestDto> processBuyOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : mapOrders(sellRawOrders);
        // checking the quantity of sell order to verify weigher they meet the demanded order
        int sellQuantity = 0;
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getPrice() >= sellOrder.getPrice() && sellOrder.getQuantity() <= order.getQuantity())
                sellQuantity += sellOrder.getQuantity();
            if (sellQuantity > order.getQuantity()) {
                break;
            }
        }
        if (sellQuantity < order.getQuantity()) {
            if (order.getSide().equals(OrderSide.LIMIT)) {
                Set<Object> buyRawOrders = zSetOps.range(BTC_BUY_ORDER_KEY, 0, -1);
                List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : mapOrders(buyRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                buyOrders.add(order);
                cacheData(BTC_BUY_ORDER_KEY, buyOrders);
                webHookResponse(order.getCallUrl(), "Order Queued waiting for some liquidity of sellers");
            } else {
                webHookResponse(order.getCallUrl(), "System needs " + (order.getQuantity() - sellQuantity) + " Sell quantity below $" + order.getPrice() + " price");
            }
            return null;
        }
        List<OrderRequestDto> transaction = new ArrayList<>();
        List<OrderRequestDto> toRemove = new ArrayList<>();
        transaction.add(order);
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getQuantity() <= 0) {
                sellOrders.removeAll(toRemove);
                cacheData(BTC_SELL_ORDER_KEY, sellOrders);
                return transaction;
            }
            if (order.getPrice() >= sellOrder.getPrice() && sellOrder.getQuantity() <= order.getQuantity()) {
                double remaining = order.getQuantity() - sellOrder.getQuantity();
                order.setQuantity(remaining);
                transaction.add(sellOrder);
                toRemove.add(sellOrder);
            }
        }
        return null;
    }

    private List<OrderRequestDto> processSellOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<Object> buyRawOrders = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : mapOrders(buyRawOrders);
        // checking the quantity of buy order to verify weigher they meet the demanded order
        int buyQuantity = 0;
        for (OrderRequestDto buyOrder : buyOrders) {
            if (order.getPrice() <= buyOrder.getPrice() && buyOrder.getQuantity() <= order.getQuantity())
                buyQuantity += buyOrder.getQuantity();
            if (buyQuantity > order.getQuantity()) {
                break;
            }
        }
        if (buyQuantity < order.getQuantity()) {
            if (order.getSide().equals(OrderSide.LIMIT)) {
                Set<Object> sellRawOrders = zSetOps.reverseRange(BTC_SELL_ORDER_KEY, 0, -1);
                List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : mapOrders(sellRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                sellOrders.add(order);
                cacheData(BTC_SELL_ORDER_KEY, sellOrders);
                webHookResponse(order.getCallUrl(), "Order Queued waiting for some liquidity of sellers");
            } else {
                webHookResponse(order.getCallUrl(), "System needs " + (order.getQuantity() - buyQuantity) + " Buy quantity above $" + order.getPrice() + " price.");
            }
            return null;
        }
        List<OrderRequestDto> transaction = new ArrayList<>();
        List<OrderRequestDto> toRemove = new ArrayList<>();

        transaction.add(order);
        for (OrderRequestDto buyOrder : buyOrders) {
            if (order.getQuantity() <= 0) {
                buyOrders.removeAll(toRemove);
                cacheData(BTC_SELL_ORDER_KEY, buyOrders);
                return transaction;
            }
            if (order.getPrice() <= buyOrder.getPrice() && buyOrder.getQuantity() <= order.getQuantity()) {
                double remaining = order.getQuantity() - buyOrder.getQuantity();
                order.setQuantity(remaining);
                transaction.add(buyOrder);
                toRemove.add(buyOrder);
            }
        }
        return null;
    }

    private void webHookResponse(String callBackUrl, String message) {
        CompletableFuture.runAsync(() -> {
            try {
                RestClient restClient = RestClient.create();
                String payload = String.format("{\"message\":\"%s\"}", message);
                restClient.post().uri(callBackUrl).contentType(MediaType.APPLICATION_JSON).body(payload).retrieve().toBodilessEntity();

                System.out.println("Webhook sent asynchronously to: " + callBackUrl);
            } catch (Exception e) {
                System.err.println("Failed to send async webhook: " + e.getMessage());
            }
        });
    }

    private void cacheData(String key, List<OrderRequestDto> ordersList) {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<ZSetOperations.TypedTuple<Object>> orderTuples = ordersList.stream().map(order -> new ZSetOperations.TypedTuple<Object>() {
            @Override
            public Object getValue() {
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
        }).collect(Collectors.toSet());
        zSetOps.add(key, orderTuples);
    }

    private List<OrderRequestDto> mapOrders(Set<Object> rawOrders) {
        // cast objects back to OrderRequestDto
        return rawOrders.stream()
                .map(obj -> (OrderRequestDto) obj)
                .collect(Collectors.toList());
    }
}
