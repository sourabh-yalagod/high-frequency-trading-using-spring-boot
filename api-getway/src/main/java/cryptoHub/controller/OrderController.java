package cryptoHub.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.CacheUserDto;
import cryptoHub.dto.CustomResponseDto;
import cryptoHub.dto.OrderRequestDto;
import cryptoHub.dto.PlaceOrderResponse;
import cryptoHub.entity.OrderEntity;
import cryptoHub.repository.OrderRepository;
import cryptoHub.service.OrderBookService;
import cryptoHub.service.RedisService;
import cryptoHub.service.SqsService;
import cryptoHub.util.OrderUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserCache;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@RestController
@RequestMapping("/api/order")
@RequiredArgsConstructor
public class OrderController {
    private final RedisTemplate<String, String> redisTemplate;
    private final OrderUtils orderUtils;
    private static final String BUY_ORDER = "buy:orders:";
    private static final String SELL_ORDER = "sell:orders:";
    private final OrderRepository orderRepository;
    private final SqsService sqsService;
    private ObjectMapper mapper = new ObjectMapper();
    private final RedisService redisService;
    private UserCache userCache;

    @PostMapping("/publish")
    public ResponseEntity<PlaceOrderResponse> publishOrder(@RequestBody OrderRequestDto order) throws JsonProcessingException {
        String cache = redisTemplate.opsForValue().get(order.getUserId());
        CacheUserDto userCache = mapper.readValue(cache, CacheUserDto.class);
        System.out.println(userCache);
        if (userCache == null) {
            return ResponseEntity
                    .badRequest()
                    .body(PlaceOrderResponse
                            .builder()
                            .isPlaced(false)
                            .userId(order.getUserId())
                            .message("User cache not found...! Please login once again...!")
                            .build());
        }
        if (order.getMargin() > userCache.getAmount()) {
            return ResponseEntity
                    .badRequest()
                    .body(PlaceOrderResponse
                            .builder()
                            .isPlaced(false)
                            .userId(order.getUserId())
                            .message("current balance can't fill the order.Please deposit $" + (order.getMargin() - userCache.getAmount()))
                            .build());
        }
        try {
            sqsService.pushToQueue(order);
            return ResponseEntity.status(202).body(
                    PlaceOrderResponse.builder()
                            .message("Order queued")
                            .isPlaced(true)
                            .userId(order.getUserId())
                            .build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                    PlaceOrderResponse.builder()
                            .message("Order failed to push to queue")
                            .userId(order.getUserId())
                            .build());
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<List<OrderEntity>> getPendingAndOpenOrdersByUserId(@PathVariable String userId) {
        List<OrderEntity> orders = orderRepository.getPendingAndOpenOrdersByUserId(userId);
        return ResponseEntity.status(201).body(orders);
    }

    @GetMapping("/closed/{userId}")
    public ResponseEntity<List<OrderEntity>> getClosedAndRejectedOrders(@PathVariable String userId) {
        List<OrderEntity> orders = orderRepository.getClosedAndRejectedOrders(userId);
        return ResponseEntity.status(201).body(orders);
    }

    @PostMapping("/update/{orderId}")
    public ResponseEntity<OrderEntity> updateOrder(@RequestBody OrderEntity orderEntity) {
        OrderEntity order = orderRepository.save(orderEntity);
        return ResponseEntity.status(201).body(order);
    }

    @GetMapping("/order-book/{asset}")
    public ResponseEntity<Object> getOrderBook(@PathVariable String asset) {
        System.out.println("OrderBook inside" + asset);
        ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();
        Set<String> sellRawOrders = zSetOps.range(SELL_ORDER.concat(asset), 0, -1);
        System.out.println(sellRawOrders);
        Set<String> buyRawOrders = zSetOps.reverseRange(BUY_ORDER.concat(asset), 0, -1);
        System.out.println(buyRawOrders);
        List<OrderRequestDto> sellOrders = orderUtils.parseOrders(sellRawOrders);
        List<OrderRequestDto> buyOrders = orderUtils.parseOrders(buyRawOrders);

        OrderBookService orderBook = new OrderBookService(buyOrders, sellOrders);
        return ResponseEntity.ok(orderBook);
    }
}