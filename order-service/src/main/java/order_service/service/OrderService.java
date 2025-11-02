package order_service.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import order_service.utils.OrderUtils;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class OrderService {
    private final SqsService sqsService;
    private final ObjectMapper mapper = new ObjectMapper();
    private final RedisTemplate<String, Object> redisTemplate;
    private final OrderUtils orderUtils;
    private static final String BTC_BUY_ORDER_KEY = "btc:buy:orders";
    private static final String BTC_SELL_ORDER_KEY = "btc:sell:orders";

    public void process(OrderRequestDto order) throws Exception {
        if (order.getId() == null) order.setId(UUID.randomUUID().toString());
        if (order.getRemainingQuantity() == null) order.setRemainingQuantity(order.getQuantity());
        System.out.println("ORDER : " + order);
        if (order.getOrderSide().equals(OrderSide.BUY)) {
            List<OrderRequestDto> buyTransaction = processBuyOrder(order);
            if (buyTransaction == null) return;
            sqsService.pushToQueue(buyTransaction);
        }

        if (order.getOrderSide().equals(OrderSide.SELL)) {
            List<OrderRequestDto> sellTransaction = processSellOrder(order);
            if (sellTransaction == null) return;
            sqsService.pushToQueue(sellTransaction);
        }
    }

    private List<OrderRequestDto> processBuyOrder(OrderRequestDto order) throws Exception {// Fetch all SELL orders from cache
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(sellRawOrders);

        double totalAvailableQty = 0;
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getPrice() >= sellOrder.getPrice()) {
                totalAvailableQty += sellOrder.getRemainingQuantity();
                if (totalAvailableQty >= order.getRemainingQuantity()) break;
            }
        }
        List<OrderRequestDto> transactions = new ArrayList<>();
        List<OrderRequestDto> toRemove = new ArrayList<>();
        transactions.add(order);
        // Handling Not enough liquidity scenario
        if (totalAvailableQty < order.getRemainingQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue buy order in cache
                Set<Object> buyRawOrders = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1);
                List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(buyRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                buyOrders.add(order);
                orderUtils.cacheData(BTC_BUY_ORDER_KEY, buyOrders);
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Order Queued waiting for seller liquidity", false, OrderStatus.PENDING));
            } else {
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Insufficient liquidity: need " + (order.getRemainingQuantity() - totalAvailableQty) + " more sell quantity below $" + order.getPrice(), true, OrderStatus.REJECTED));
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
                    System.out.println("FIRST : " + transactions.getFirst().toString());
                    orderUtils.webHookResponse(sellOrder.getCallUrl(), orderUtils.customWebSocketResponse(sellOrder, "Order partially filled. Please wait for further " + sellOrder.getRemainingQuantity() + " to get filled.", true, OrderStatus.PENDING));
                    break;
                }
            }
        }
        toRemove.forEach((filledOrder) -> {
            filledOrder.setStatus(OrderStatus.OPEN);
            orderUtils.webHookResponse(filledOrder.getCallUrl(), orderUtils.customWebSocketResponse(filledOrder, "Order filled", false, OrderStatus.OPEN));
        });
        transactions.getFirst().setRemainingQuantity(0.0);
        transactions.getFirst().setStatus(OrderStatus.OPEN);
        transactions.getFirst().setCreatedAt(LocalDateTime.now().toString());
        orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Buy order executed successfully", false, OrderStatus.OPEN));
        // Remove fully matched orders and update cache
        sellOrders.removeAll(toRemove);
        orderUtils.cacheData(BTC_SELL_ORDER_KEY, sellOrders);
        // Notify or process transactions
        return transactions;
    }

    private List<OrderRequestDto> processSellOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        // Fetch all BUY orders from cache (sorted descending)
        Set<Object> buyRawOrders = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(buyRawOrders);
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
        if (totalAvailableQty < order.getRemainingQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue sell order in cache
                Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
                List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(sellRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                sellOrders.add(order);
                orderUtils.cacheData(BTC_SELL_ORDER_KEY, sellOrders);
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Order Queued waiting for buyer liquidity", false, OrderStatus.PENDING));
            } else {
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Insufficient liquidity: need " + (order.getRemainingQuantity() - totalAvailableQty) + " more buy quantity above $" + order.getPrice(), true, OrderStatus.REJECTED));
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
                    orderUtils.webHookResponse(buyOrder.getCallUrl(), orderUtils.customWebSocketResponse(buyOrder, "Order partially filled. Please wait for further " + buyOrder.getRemainingQuantity() + " to get filled.", true, OrderStatus.PENDING));
                    break;
                }
            }
        }

        // Notify filled orders
        toRemove.forEach((filledOrder) -> {
            filledOrder.setStatus(OrderStatus.OPEN);
            orderUtils.webHookResponse(filledOrder.getCallUrl(), orderUtils.customWebSocketResponse(filledOrder, "Order filled", false, OrderStatus.OPEN));
        });

        transactions.getFirst().setRemainingQuantity(0.0);
        transactions.getFirst().setStatus(OrderStatus.OPEN);
        transactions.getFirst().setCreatedAt(LocalDateTime.now().toString());
        // Notify current sell order
        if (order.getRemainingQuantity() == 0) {
            order.setStatus(OrderStatus.OPEN);
        }
        orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Sell order executed successfully", false, OrderStatus.OPEN));

        // Remove fully matched orders and update cache
        buyOrders.removeAll(toRemove);
        orderUtils.cacheData(BTC_BUY_ORDER_KEY, buyOrders);

        // Notify or process transactions
        return transactions;
    }
}
