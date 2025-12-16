package cryptoHub.controller;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.CacheUserDto;
import cryptoHub.dto.OrderRequestDto;
import cryptoHub.dto.PlaceOrderResponse;
import cryptoHub.entity.OrderEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.OrderRepository;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.OrderBookService;
import cryptoHub.service.RedisService;
import cryptoHub.service.SqsService;
import cryptoHub.specifications.OrderSpecification;
import cryptoHub.types.OrderSide;
import cryptoHub.types.OrderStatus;
import cryptoHub.util.OrderUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.userdetails.UserCache;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

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
    private final UserRepository userRepository;

    @PostMapping("/publish")
    public ResponseEntity<PlaceOrderResponse> publishOrder(@RequestBody OrderRequestDto order) throws JsonProcessingException {
        String cache = redisTemplate.opsForValue().get(order.getUserId());
        CacheUserDto userCache = mapper.readValue(cache, CacheUserDto.class);
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
    public ResponseEntity<Object> updateOrder(@RequestBody OrderEntity orderEntity) {
        OrderEntity order = orderRepository.save(orderEntity);
        Optional<UserEntity> user = userRepository.findById(order.getUserId());
        if (user.isPresent() && order.getStatus().equals(OrderStatus.CLOSED) && !order.getProfitLoss().isNaN() && order.getProfitLoss() == 0) {
            boolean isDeleted = removeOrderFromCacheAndDb(order, user.get());
            System.out.println("isDeleted : " + isDeleted);
            if (!isDeleted) {
                return ResponseEntity.status(401).body(
                        PlaceOrderResponse
                                .builder()
                                .userId(order.getUserId())
                                .isPlaced(false)
                                .message("order closing failed Please try again later")
                                .build()
                );
            }
        } else {
            CacheUserDto cacheUserDto = redisService.getUser(user.get().getId());
            Double updatedAmount = cacheUserDto.getAmount() + order.getProfitLoss();
            cacheUserDto.setAmount(updatedAmount);
            redisService.cacheUser(cacheUserDto);
            user.get().setAmount(updatedAmount);
            userRepository.save(user.get());
        }
        return ResponseEntity.status(201).body(order);
    }

    @GetMapping("/order-book/{asset}")
    public ResponseEntity<Object> getOrderBook(@PathVariable String asset) {
        ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();
        Set<String> sellRawOrders = zSetOps.range(SELL_ORDER.concat(asset), 0, -1);
        Set<String> buyRawOrders = zSetOps.reverseRange(BUY_ORDER.concat(asset), 0, -1);
        List<OrderRequestDto> sellOrders = orderUtils.parseOrders(sellRawOrders);
        List<OrderRequestDto> buyOrders = orderUtils.parseOrders(buyRawOrders);
        OrderBookService orderBook = new OrderBookService(buyOrders, sellOrders);
        return ResponseEntity.ok(orderBook);
    }

    public boolean removeOrderFromCacheAndDb(OrderEntity order, UserEntity user) {
        try {
            ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();
            ObjectMapper mapper = new ObjectMapper();

            String orderSide = order.getOrderSide() == OrderSide.BUY ? BUY_ORDER : SELL_ORDER;
            String key = orderSide.concat(order.getAsset());

            // 1. Get all orders (value + score)
            Set<ZSetOperations.TypedTuple<String>> tuples =
                    zSetOps.reverseRangeWithScores(key, 0, -1);
            System.out.println("tuples : " + tuples);
            if (tuples == null || tuples.isEmpty()) {
                return false;
            }

            String targetId = order.getId();

            // 2. Filter and keep everything except this order ID
            Set<ZSetOperations.TypedTuple<String>> updatedTuples =
                    tuples.stream()
                            .filter(t -> {
                                try {
                                    Map<String, Object> map = mapper.readValue(t.getValue(), Map.class);
                                    String id = (String) map.get("id");
                                    return !id.equals(targetId);   // <-- REMOVE this exact order
                                } catch (Exception e) {
                                    return true; // keep element if parsing fails
                                }
                            })
                            .collect(Collectors.toSet());
            redisTemplate.delete(key);
            updatedTuples.forEach(tuple -> {
                zSetOps.add(key, tuple.getValue(), tuple.getScore());
            });
            // 4. Update user amount in DB + cache
            double updatedAmount = order.getProfitLoss() != 0.0 ? user.getAmount() + order.getProfitLoss() : user.getAmount() + Double.parseDouble(order.getMargin());
            System.out.println("updatedAmount : " + updatedAmount);
            user.setAmount(updatedAmount);

            CacheUserDto cachedUser = redisService.getUser(user.getId());
            cachedUser.setAmount(updatedAmount);

            userRepository.save(user);
            redisService.cacheUser(cachedUser);

            return true;

        } catch (Exception e) {
            System.out.println("Error removing order: " + e.getMessage());
            return false;
        }
    }

    @GetMapping("/orders-pagination")
    public ResponseEntity<List<OrderEntity>> getOrderByPagination(@RequestParam(required = false, defaultValue = "5") int limit,
                                                                  @RequestParam(required = false, defaultValue = "0") int page,
                                                                  @RequestParam(required = false, defaultValue = "createdAt") String filter,
                                                                  @RequestParam(required = false, defaultValue = "ASC") String sort,
                                                                  @RequestParam(required = false, defaultValue = "") String search
    ) {
        Sort sortObj = sort.startsWith("ASC") ? Sort.by(filter).ascending() : Sort.by(filter).descending();
        PageRequest pageRequest = PageRequest.of(page, limit, sortObj);
        Specification<OrderEntity> spec = OrderSpecification.getOrderSpecification(search);
        System.out.println(spec.toString());
        List<OrderEntity> orders = orderRepository.findAll(spec, pageRequest).getContent();
        System.out.println(orders.toString());
        return ResponseEntity.ok(orders);
    }
}