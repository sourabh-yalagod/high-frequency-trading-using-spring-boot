package order_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.Response.WebSocketResponseDto;
import order_service.request.OrderRequestDto;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import order_service.utils.OrderUtils;
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
    private final OrderUtils orderUtils;
    private static final String BTC_BUY_ORDER_KEY = "btc:buy:orders";
    private static final String BTC_SELL_ORDER_KEY = "btc:sell:orders";

    public void process(OrderRequestDto order) throws Exception {
        if (order.getOrderSide().equals(OrderSide.BUY)) {
            List<OrderRequestDto> buyTransaction = processBuyOrder(order);
            System.out.println("BuyTransaction : " + buyTransaction);
        }
        if (order.getOrderSide().equals(OrderSide.SELL)) {
            List<OrderRequestDto> sellTransaction = processSellOrder(order);
            System.out.println("SellTransaction : " + sellTransaction);
        }
    }

    private List<OrderRequestDto> processBuyOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        // Fetch all SELL orders from cache
        Set<Object> sellRawOrders = zSetOps.reverseRange(BTC_SELL_ORDER_KEY, 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(sellRawOrders);

        double totalAvailableQty = 0;
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getPrice() >= sellOrder.getPrice()) {
                totalAvailableQty += sellOrder.getQuantity();
                if (totalAvailableQty >= order.getQuantity()) break;
            }
        }

        // Handling Not enough liquidity scenario
        if (totalAvailableQty < order.getQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue buy order in cache
                Set<Object> buyRawOrders = zSetOps.range(BTC_BUY_ORDER_KEY, 0, -1);
                List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(buyRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                buyOrders.add(order);
                orderUtils.cacheData(BTC_BUY_ORDER_KEY, buyOrders);
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Order Queued waiting for seller liquidity", false));
            } else {
                orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Insufficient liquidity: need " + (order.getQuantity() - totalAvailableQty) + " more sell quantity below $" + order.getPrice(), true));
            }
            return null;
        }

        // Perform Order Matching
        List<OrderRequestDto> transactions = new ArrayList<>();
        List<OrderRequestDto> toRemove = new ArrayList<>();
        transactions.add(order);

        double remainingQty = order.getQuantity();

        for (OrderRequestDto sellOrder : sellOrders) {
            if (remainingQty <= 0) break;
            if (order.getPrice() >= sellOrder.getPrice()) {
                if (sellOrder.getQuantity() <= remainingQty) {
                    // Fully consume this sell order
                    remainingQty -= sellOrder.getQuantity();
                    toRemove.add(sellOrder);
                    transactions.add(sellOrder);
                } else {
                    // Partially fill sell order
                    double leftover = sellOrder.getQuantity() - remainingQty;
                    sellOrder.setQuantity(leftover);
                    transactions.add(
                            new OrderRequestDto(
                                    sellOrder.getAsset(),
                                    sellOrder.getUserId(),
                                    sellOrder.getOrderType(),
                                    sellOrder.getPrice(),
                                    sellOrder.getCallUrl(),
                                    remainingQty,
                                    sellOrder.getMargin(),
                                    sellOrder.getStatus(),
                                    sellOrder.getOrderSide()));
                    remainingQty = 0;
                    orderUtils.webHookResponse(sellOrder.getCallUrl(), orderUtils.customWebSocketResponse(sellOrder, "Order partially filled. Please wait for further " + sellOrder.getQuantity() + " to get filled.", true));
                    break;
                }
            }
        }
        toRemove.forEach((filledOrder) -> {
            filledOrder.setStatus(OrderStatus.OPEN);
            orderUtils.webHookResponse(filledOrder.getCallUrl(), orderUtils.customWebSocketResponse(filledOrder, "Order filled", false));
        });
        order.setStatus(OrderStatus.OPEN);
        orderUtils.webHookResponse(order.getCallUrl(), orderUtils.customWebSocketResponse(order, "Buy order executed successfully", false));
        // Remove fully matched orders and update cache
        sellOrders.removeAll(toRemove);
        orderUtils.cacheData(BTC_SELL_ORDER_KEY, sellOrders);

        // Notify or process transactions
        return transactions;
    }


    private List<OrderRequestDto> processSellOrder(OrderRequestDto sellOrder) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        // Fetch all buy orders from redis cache (sorted descending by price)
        Set<Object> buyRawOrders = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(buyRawOrders);

        List<OrderRequestDto> transactions = new ArrayList<>();
        List<OrderRequestDto> executedBuyOrders = new ArrayList<>();

        double remainingQty = sellOrder.getQuantity();

        // Match the SELL order against BUY orders
        for (OrderRequestDto buyOrder : buyOrders) {
            // Sell can only execute if buyer's price >= seller's price
            if (buyOrder.getPrice() < sellOrder.getPrice()) continue;

            // Determine matched quantity
            double matchedQty = Math.min(remainingQty, buyOrder.getQuantity());

            // Create transaction records
            transactions.add(
                    new OrderRequestDto(
                            sellOrder.getAsset(),
                            sellOrder.getUserId(),
                            sellOrder.getOrderType(),
                            sellOrder.getPrice(),
                            sellOrder.getCallUrl(),
                            matchedQty,
                            sellOrder.getMargin(),
                            OrderStatus.OPEN,
                            sellOrder.getOrderSide(),
                            LocalDateTime.now().toString()));

            transactions.add(
                    new OrderRequestDto(
                            buyOrder.getAsset(),
                            buyOrder.getUserId(),
                            buyOrder.getOrderType(),
                            buyOrder.getPrice(),
                            buyOrder.getCallUrl(),
                            matchedQty,
                            buyOrder.getMargin(),
                            OrderStatus.OPEN,
                            buyOrder.getOrderSide(),
                            LocalDateTime.now().toString()));

            // Update quantities
            remainingQty -= matchedQty;
            buyOrder.setQuantity(buyOrder.getQuantity() - matchedQty);

            if (buyOrder.getQuantity() <= 0) {
                executedBuyOrders.add(buyOrder);
            }

            if (remainingQty <= 0) break;
        }

        // Remove executed buy orders from the book
        buyOrders.removeAll(executedBuyOrders);
        orderUtils.cacheData(BTC_BUY_ORDER_KEY, buyOrders);

        // If still remaining quantity (partially filled or unfilled)
        if (remainingQty > 0) {
            if (sellOrder.getOrderType() == OrderType.LIMIT) {
                // Add remaining sell order to SELL book
                Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
                List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : orderUtils.mapOrders(sellRawOrders);

                sellOrder.setQuantity(remainingQty);
                sellOrder.setCreatedAt(LocalDateTime.now().toString());
                sellOrders.add(sellOrder);

                orderUtils.cacheData(BTC_SELL_ORDER_KEY, sellOrders);
                orderUtils.webHookResponse(sellOrder.getCallUrl(), orderUtils.customWebSocketResponse(sellOrder, "Order partially filled and remaining added to sell book.", true));
            } else {
                orderUtils.webHookResponse(sellOrder.getCallUrl(), orderUtils.customWebSocketResponse(sellOrder, "Market sell order partially filled. Remaining " + remainingQty + " could not be matched.", true));
            }
        } else {
            orderUtils.webHookResponse(sellOrder.getCallUrl(), orderUtils.customWebSocketResponse(sellOrder, "Sell order fully executed.", false));
        }
        return transactions;
    }

}
