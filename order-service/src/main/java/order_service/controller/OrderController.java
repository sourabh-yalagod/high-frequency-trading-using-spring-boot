package order_service.controller;

import lombok.RequiredArgsConstructor;
import order_service.Response.WebSocketResponseDto;
import order_service.request.OrderRequestDto;
import order_service.service.OrderService;
import order_service.types.Assets;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import order_service.utils.OrderUtils;
import org.springframework.core.annotation.Order;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.Set;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;
    private final OrderUtils orderUtils;
    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/order")
    public void newOrder(@RequestBody OrderRequestDto payload) throws Exception {
        orderService.process(payload);
    }

    @PostMapping("/order/callback/{userId}")
    public ResponseEntity<Void> handleCallback(@PathVariable String userId) {
        System.out.println("Webhook received: " + userId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/test/{count}")
    public void test(@PathVariable int count) throws Exception {
        for (int i = 0; i < count; i++) {
            orderService.process(randomOrders());
        }
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        // Fetch all SELL orders from cache
        System.out.println("Sell Orders");
        Set<Object> sellRawOrders = zSetOps.range("btc:sell:orders", 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(sellRawOrders);
        sellOrders.forEach(System.out::println);
        System.out.println("Buyers Orders");
        Set<Object> buyRawOrders = zSetOps.reverseRange("btc:buy:orders", 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(buyRawOrders);
        buyOrders.forEach(System.out::println);
    }

    public OrderRequestDto randomOrders() {
        Random random = new Random();

        double price = Math.floor(1 + (100 - 1) * random.nextDouble());
        double quantity = Math.floor(1 + (10 - 1) * random.nextDouble());
        OrderSide orderSide = random.nextBoolean() ? OrderSide.BUY : OrderSide.SELL;

        String userId = "user - " + (random.nextInt(1000) + 1);
        String callUrl = "http://localhost:8080/order/callback/" + userId;

        return OrderRequestDto.builder()
                .asset(Assets.BTC)
                .userId(userId)
                .orderType(OrderType.LIMIT)
                .price(price)
                .callUrl(callUrl)
                .quantity(quantity)
                .margin("0.01")
                .status(OrderStatus.PENDING)
                .orderSide(orderSide)
                .createdAt(LocalDateTime.now().toString())
                .build();
    }
}
