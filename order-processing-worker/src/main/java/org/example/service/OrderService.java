package org.example.service;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.OrderUtils;
import org.example.dtos.CacheUserDto;
import org.example.dtos.OrderRequestDto;
import org.example.types.OrderSide;
import org.example.types.OrderStatus;
import org.example.types.OrderType;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;
import software.amazon.awssdk.services.sqs.model.SendMessageResponse;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {
    private final ObjectMapper mapper = new ObjectMapper();
    private RedisTemplate<String, Object> redisTemplate = null;
    private final SqsClient sqsClient;
    private OrderUtils orderUtils = new OrderUtils(redisTemplate);
    private static final String BUY_ORDER = "buy:orders:";
    private static final String SELL_ORDER = "sell:orders:";

    public OrderService(RedisTemplate<String, Object> redisTemplate, SqsClient sqsClient) {
        this.redisTemplate = redisTemplate;
        this.sqsClient = sqsClient;
    }

    public void process(OrderRequestDto order) throws Exception {
        Object rawCachedUser = redisTemplate.opsForValue().get(order.getUserId());
        if (rawCachedUser == null) return;
        CacheUserDto cacheUserDto = mapper.convertValue(rawCachedUser, CacheUserDto.class);
        if (cacheUserDto == null) return;
        if (order.getId() == null) order.setId(UUID.randomUUID().toString());
        if (order.getRemainingQuantity() == null) order.setRemainingQuantity(order.getQuantity());

        if (order.getOrderSide().equals(OrderSide.BUY)) {
            List<OrderRequestDto> buyTransaction = processBuyOrder(order);
            if (buyTransaction == null) return;
            pushToQueue(buyTransaction);
        }

        if (order.getOrderSide().equals(OrderSide.SELL)) {
            List<OrderRequestDto> sellTransaction = processSellOrder(order);
            if (sellTransaction == null) return;
            pushToQueue(sellTransaction);
        }

        CacheUserDto updatedCache = CacheUserDto.builder()
                .amount(cacheUserDto.getAmount() - order.getMargin())
                .email(cacheUserDto.getEmail())
                .isLocked(false)
                .userId(order.getUserId())
                .build();
        redisTemplate.opsForValue().set(order.getUserId(), updatedCache);
        System.out.println("Updated Cached User : " + updatedCache);
        pushToUserQueue(order);
    }

    private List<OrderRequestDto> processBuyOrder(OrderRequestDto order) throws Exception {
        // Fetch all SELL orders from cache
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<Object> sellRawOrders = zSetOps.range(SELL_ORDER.concat(order.getAsset().toString()), 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : OrderUtils.mapOrders(sellRawOrders);

        double totalAvailableQty = 0;
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getPrice() >= sellOrder.getPrice()) {
                totalAvailableQty += sellOrder.getRemainingQuantity();
                if (totalAvailableQty >= order.getRemainingQuantity()) break;
            }
        }
        List<OrderRequestDto> transactions = new ArrayList<OrderRequestDto>();
        List<OrderRequestDto> toRemove = new ArrayList<OrderRequestDto>();
        transactions.add(order);
        // Handling Not enough liquidity scenario
        Set<Object> buyRawOrders = zSetOps.reverseRange(BUY_ORDER.concat(order.getAsset().toString()), 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : OrderUtils.mapOrders(buyRawOrders);
        if (totalAvailableQty < order.getRemainingQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue buy order in cache
                order.setCreatedAt(LocalDateTime.now().toString());
                order.setStatus(OrderStatus.PENDING);
                buyOrders.add(order);
                OrderUtils.cacheData(BUY_ORDER.concat(order.getAsset().toString()), buyOrders);
                pushToOrderBook(order, buyOrders, sellOrders);
                OrderUtils.webHookResponse(order);
            } else {
                order.setStatus(OrderStatus.REJECTED);
                OrderUtils.webHookResponse(order);
                return null;
            }
            return transactions;
        }
        // Perform Order Matching

        double remainingQty = order.getRemainingQuantity();

        for (OrderRequestDto sellOrder : sellOrders) {
            if (remainingQty <= 0) break;
            if (order.getPrice() >= sellOrder.getPrice()) {
                sellOrder.setCreatedAt(LocalDateTime.now().toString());
                if (sellOrder.getRemainingQuantity() <= remainingQty) {
                    // Fully consume this sell order
                    remainingQty -= sellOrder.getRemainingQuantity();
                    sellOrder.setRemainingQuantity(0.0);
                    sellOrder.setStatus(OrderStatus.OPEN);
                    toRemove.add(sellOrder);
                    transactions.add(sellOrder);
                } else {
                    // Partially fill sell order
                    double leftover = sellOrder.getRemainingQuantity() - remainingQty;
                    sellOrder.setRemainingQuantity(leftover);
                    transactions.add(sellOrder);
                    order.setStatus(OrderStatus.OPEN);
                    order.setRemainingQuantity(0.0);
                    OrderUtils.webHookResponse(order);
                    break;
                }
            }
        }
        toRemove.forEach((filledOrder) -> {
            filledOrder.setStatus(OrderStatus.OPEN);
            try {
                OrderUtils.webHookResponse(filledOrder);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        });
        transactions.get(0).setRemainingQuantity(0.0);
        transactions.get(0).setStatus(OrderStatus.OPEN);
        transactions.get(0).setCreatedAt(LocalDateTime.now().toString());
        OrderUtils.webHookResponse(order);
        // Remove fully matched orders and update cache
        sellOrders.removeAll(toRemove);
        OrderUtils.cacheData(SELL_ORDER.concat(order.getAsset().toString()), sellOrders);
        // Notify or process transactions
        pushToOrderBook(order, buyOrders, sellOrders);
        return transactions;
    }

    private List<OrderRequestDto> processSellOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        // Fetch all BUY orders from cache (sorted descending)
        Set<Object> buyRawOrders = zSetOps.reverseRange(BUY_ORDER.concat(order.getAsset().toString()), 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : OrderUtils.mapOrders(buyRawOrders);
        double totalAvailableQty = 0;
        for (OrderRequestDto buyOrder : buyOrders) {
            if (buyOrder.getPrice() >= order.getPrice()) {
                totalAvailableQty += buyOrder.getRemainingQuantity();
                if (totalAvailableQty >= order.getRemainingQuantity()) break;
            }
        }
        List<OrderRequestDto> transactions = new ArrayList<>();
        List<OrderRequestDto> toRemove = new ArrayList<>();
        transactions.add(order);
        // Handling Not enough liquidity scenario
        Set<Object> sellRawOrders = zSetOps.range(SELL_ORDER.concat(order.getAsset().toString()), 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : OrderUtils.mapOrders(sellRawOrders);
        if (totalAvailableQty < order.getRemainingQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue sell order in cache
                order.setCreatedAt(LocalDateTime.now().toString());
                order.setStatus(OrderStatus.PENDING);
                sellOrders.add(order);
                OrderUtils.cacheData(SELL_ORDER.concat(order.getAsset().toString()), sellOrders);
                pushToOrderBook(order, buyOrders, sellOrders);
                OrderUtils.webHookResponse(order);
            } else {
                order.setStatus(OrderStatus.REJECTED);
                OrderUtils.webHookResponse(order);
                return null;
            }
            return transactions;
        }

        // Perform Order Matching

        double remainingQty = order.getRemainingQuantity();

        for (OrderRequestDto buyOrder : buyOrders) {
            if (remainingQty <= 0) break;
            if (buyOrder.getPrice() >= order.getPrice()) {
                buyOrder.setCreatedAt(LocalDateTime.now().toString());
                if (buyOrder.getRemainingQuantity() <= remainingQty) {
                    // Fully consume this buy order
                    remainingQty -= buyOrder.getRemainingQuantity();
                    buyOrder.setRemainingQuantity(0.0);
                    buyOrder.setStatus(OrderStatus.OPEN);
                    toRemove.add(buyOrder);
                    transactions.add(buyOrder);
                } else {
                    // Partially fill buy order
                    double leftover = buyOrder.getRemainingQuantity() - remainingQty;
                    buyOrder.setRemainingQuantity(leftover);
                    transactions.add(buyOrder);
                    order.setStatus(OrderStatus.OPEN);
                    OrderUtils.webHookResponse(order);
                    break;
                }
            }
        }

        // Notify filled orders
        toRemove.forEach((filledOrder) -> {
            filledOrder.setStatus(OrderStatus.OPEN);
            try {
                OrderUtils.webHookResponse(filledOrder);
            } catch (Exception e) {
                System.out.println(e.getMessage());
            }
        });

        transactions.get(0).setRemainingQuantity(0.0);
        transactions.get(0).setStatus(OrderStatus.OPEN);
        transactions.get(0).setCreatedAt(LocalDateTime.now().toString());
        // Notify current sell order
        if (order.getRemainingQuantity() == 0) {
            order.setStatus(OrderStatus.OPEN);
        }
        OrderUtils.webHookResponse(order);
        // Remove fully matched orders and update cache
        buyOrders.removeAll(toRemove);
        OrderUtils.cacheData(BUY_ORDER.concat(order.getAsset().toString()), buyOrders);

        // Notify or process transactions
        pushToOrderBook(order, buyOrders, sellOrders);
        return transactions;
    }

    public void pushToQueue(List<OrderRequestDto> orders) throws JsonProcessingException {
        try {
            if (orders == null || orders.isEmpty()) return;
            ObjectMapper objectMapper = new ObjectMapper();
            boolean isPendingOrder = orders.size() == 1;
            String jsonBody = objectMapper.writeValueAsString(isPendingOrder ? orders.get(0) : orders);
            String queueUrl = isPendingOrder ? "https://sqs.eu-north-1.amazonaws.com/638335486382/btc-pending-orders.fifo" : "https://sqs.eu-north-1.amazonaws.com/638335486382/btc-transactions.fifo";
            String messageGroupId = isPendingOrder ? "btc-pending-orders" : "btc-transactions";
            System.out.println("JSON ORDER : " + jsonBody);
            SendMessageRequest request = SendMessageRequest.builder().
                    queueUrl(queueUrl)
                    .messageGroupId(messageGroupId + UUID.randomUUID().toString())
                    .messageDeduplicationId(UUID.randomUUID().toString())
                    .messageBody(jsonBody)
                    .build();
            SendMessageResponse res = sqsClient.sendMessage(request);
            System.out.println("Message Send Response : " + res.md5OfMessageBody());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void pushToUserQueue(OrderRequestDto order) throws JsonProcessingException {
        try {
            if (order == null) return;
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonBody = objectMapper.writeValueAsString(order);
            String queueUrl = "https://sqs.eu-north-1.amazonaws.com/638335486382/user-queue.fifo";
            String messageGroupId = "user-queue";
            System.out.println("JSON ORDER : " + jsonBody);
            SendMessageRequest request = SendMessageRequest.builder().
                    queueUrl(queueUrl)
                    .messageGroupId(messageGroupId + UUID.randomUUID().toString())
                    .messageDeduplicationId(UUID.randomUUID().toString())
                    .messageBody(jsonBody)
                    .build();
            SendMessageResponse res = sqsClient.sendMessage(request);
            System.out.println("Message Send Response : " + res.md5OfMessageBody());
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public void pushToOrderBook(OrderRequestDto userOrder, List<OrderRequestDto> buyOrders, List<OrderRequestDto> sellOrders) throws JsonProcessingException {
        try {
            if (buyOrders.isEmpty()) {
                OrderRequestDto order = OrderRequestDto.builder()
                        .userId(userOrder.getUserId())
                        .asset(userOrder.getAsset())
                        .orderSide(OrderSide.BUY)
                        .price(0.0)
                        .quantity(0.0).build();
                buyOrders.add(order);
            }
            if (sellOrders.isEmpty()) {
                OrderRequestDto order = OrderRequestDto.builder()
                        .userId(userOrder.getUserId())
                        .asset(userOrder.getAsset())
                        .orderSide(OrderSide.SELL)
                        .price(0.0)
                        .quantity(0.0)
                        .build();
                sellOrders.add(order);
            }
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, List<OrderRequestDto>> orderBookMap = new HashMap<>();
            orderBookMap.put("buyOrders", buyOrders);
            orderBookMap.put("sellOrders", sellOrders);
            String jsonBody = objectMapper.writeValueAsString(orderBookMap);
            String queueUrl = "https://sqs.eu-north-1.amazonaws.com/638335486382/btc-orderBook.fifo";
            String messageGroupId = "orderBook-" + UUID.randomUUID();
            SendMessageRequest request = SendMessageRequest.builder()
                    .queueUrl(queueUrl)
                    .messageGroupId(messageGroupId)
                    .messageDeduplicationId(UUID.randomUUID().toString())
                    .messageBody(jsonBody)
                    .build();
            sqsClient.sendMessage(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public OrderRequestDto randomOrders() {
        Random random = new Random();

        double price = Math.floor(1 + (100 - 1) * random.nextDouble());
        double quantity = Math.floor(1 + (10 - 1) * random.nextDouble());
        OrderSide orderSide = random.nextBoolean() ? OrderSide.BUY : OrderSide.SELL;

        String userId = "2ae9cc9d-54c6-43a7-b90d-21646afacbaf";
        String callUrl = "https://cryptohub-api-getway.onrender.com/order/webhook/" + userId;

        return OrderRequestDto.builder()
                .asset("BTCUSD")
                .userId(userId)
                .orderType(OrderType.LIMIT)
                .price(price)
                .callUrl(callUrl)
                .quantity(quantity)
                .margin(price * quantity)
                .status(OrderStatus.PENDING)
                .orderSide(orderSide)
                .createdAt(LocalDateTime.now().toString())
                .build();
    }
}

