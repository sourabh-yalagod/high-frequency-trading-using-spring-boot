package order_service.controller;

import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import order_service.service.OrderService;
import order_service.service.WebHookService;
import order_service.types.Assets;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import order_service.utils.OrderUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Random;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final WebHookService webHookService;
    private final OrderService orderService;
    private final OrderUtils orderUtils;
    private final RedisTemplate<String, Object> redisTemplate;

    @PostMapping("/order")
    public void newOrder(@RequestBody OrderRequestDto payload) throws Exception {
        orderService.process(payload);
    }

    // SSE endpoint - Client connects here
    @GetMapping(value = "/events/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable String userId) {
        System.out.println("User " + userId + " connected via SSE");
        return webHookService.createEmitter(userId);
    }

    // Your webhook endpoint
    @PostMapping("/order/callback/{userId}")
    public ResponseEntity<Void> handleCallback(@PathVariable String userId) {
        System.out.println("UserId : " + userId);
        // Prepare payload to send to client
        Map<String, Object> payload = Map.of(
                "event", "order_callback",
                "userId", userId,
                "timestamp", System.currentTimeMillis()
        );

        // Send to connected client
        boolean sent = webHookService.sendToUser(userId, payload);
        if (sent) {
            System.out.println("Webhook delivered to user " + userId);
        } else {
            System.out.println("User " + userId + " not connected - webhook not delivered");
        }

        return ResponseEntity.ok().build();
    }

    @GetMapping("/test/{count}")
    public void test(@PathVariable int count) throws Exception {
        for (int i = 0; i < count; i++) {
            orderService.process(randomOrders());
        }
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
                .margin(String.valueOf(Math.floor(price * quantity)))
                .status(OrderStatus.PENDING)
                .orderSide(orderSide)
                .createdAt(LocalDateTime.now().toString())
                .build();
    }
}
