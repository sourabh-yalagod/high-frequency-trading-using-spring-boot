package order_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import order_service.types.OrderSide;
import order_service.types.OrderStatus;
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
        Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
        List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : mapOrders(sellRawOrders);

        // Sort sell orders by ascending price (best deals first)
        sellOrders.sort(Comparator.comparingDouble(OrderRequestDto::getPrice));

        double totalAvailableQty = 0;
        for (OrderRequestDto sellOrder : sellOrders) {
            if (order.getPrice() >= sellOrder.getPrice()) {
                totalAvailableQty += sellOrder.getQuantity();
                if (totalAvailableQty >= order.getQuantity()) break;
            }
        }

        // Not enough liquidity
        if (totalAvailableQty < order.getQuantity()) {
            if (order.getOrderType().equals(OrderType.LIMIT)) {
                // Queue buy order in cache
                Set<Object> buyRawOrders = zSetOps.range(BTC_BUY_ORDER_KEY, 0, -1);
                List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : mapOrders(buyRawOrders);
                order.setCreatedAt(LocalDateTime.now().toString());
                buyOrders.add(order);
                cacheData(BTC_BUY_ORDER_KEY, buyOrders);
                webHookResponse(order.getCallUrl(), "Order Queued waiting for seller liquidity");
            } else {
                webHookResponse(order.getCallUrl(), "Insufficient liquidity: need " + (order.getQuantity() - totalAvailableQty) + " more sell quantity below $" + order.getPrice());
            }
            return null;
        }

        // Perform matching
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
                    transactions.add(new OrderRequestDto(sellOrder.getAsset(), sellOrder.getUserId(), sellOrder.getOrderType(), sellOrder.getPrice(), sellOrder.getCallUrl(), remainingQty, sellOrder.getMargin(), sellOrder.getStatus(), sellOrder.getOrderSide()));
                    remainingQty = 0;
                    break;
                }
            }
        }

        // Remove fully matched orders and update cache
        sellOrders.removeAll(toRemove);
        cacheData(BTC_SELL_ORDER_KEY, sellOrders);

        // Notify or process transactions
        webHookResponse(order.getCallUrl(), "Buy order executed successfully");
        return transactions;
    }


    private List<OrderRequestDto> processSellOrder(OrderRequestDto sellOrder) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        // Fetch all buy orders (sorted descending by price)
        Set<Object> buyRawOrders = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1);
        List<OrderRequestDto> buyOrders = buyRawOrders == null ? new ArrayList<>() : mapOrders(buyRawOrders);

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
            transactions.add(new OrderRequestDto(
                    sellOrder.getAsset(),
                    sellOrder.getUserId(),
                    sellOrder.getOrderType(),
                    sellOrder.getPrice(),
                    sellOrder.getCallUrl(),
                    matchedQty,
                    sellOrder.getMargin(),
                    OrderStatus.OPEN,
                    sellOrder.getOrderSide(),
                    LocalDateTime.now().toString()
            ));

            transactions.add(new OrderRequestDto(
                    buyOrder.getAsset(),
                    buyOrder.getUserId(),
                    buyOrder.getOrderType(),
                    buyOrder.getPrice(),
                    buyOrder.getCallUrl(),
                    matchedQty,
                    buyOrder.getMargin(),
                    OrderStatus.OPEN,
                    buyOrder.getOrderSide(),
                    LocalDateTime.now().toString()
            ));

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
        cacheData(BTC_BUY_ORDER_KEY, buyOrders);

        // If still remaining quantity (partially filled or unfilled)
        if (remainingQty > 0) {
            if (sellOrder.getOrderType() == OrderType.LIMIT) {
                // Add remaining sell order to SELL book
                Set<Object> sellRawOrders = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1);
                List<OrderRequestDto> sellOrders = sellRawOrders == null ? new ArrayList<>() : mapOrders(sellRawOrders);

                sellOrder.setQuantity(remainingQty);
                sellOrder.setCreatedAt(LocalDateTime.now().toString());
                sellOrders.add(sellOrder);

                cacheData(BTC_SELL_ORDER_KEY, sellOrders);
                webHookResponse(sellOrder.getCallUrl(), "Order partially filled and remaining added to sell book.");
            } else {
                webHookResponse(sellOrder.getCallUrl(),
                        "Market sell order partially filled. Remaining " + remainingQty + " could not be matched.");
            }
        } else {
            webHookResponse(sellOrder.getCallUrl(), "Sell order fully executed.");
        }
        return transactions;
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
        if (ordersList == null || ordersList.isEmpty()) {
            System.out.println("No orders to cache for key: " + key);
            redisTemplate.delete(key);
            return;
        }

        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();

        Set<ZSetOperations.TypedTuple<Object>> orderTuples = ordersList.stream()
                .filter(order -> order != null && order.getPrice() != null)
                .map(order -> new ZSetOperations.TypedTuple<Object>() {
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
                })
                .collect(Collectors.toSet());

        if (orderTuples.isEmpty()) {
            System.out.println("⚠️ No valid orders to cache for key: " + key);
            redisTemplate.delete(key);
            return;
        }

        redisTemplate.delete(key);
        zSetOps.add(key, orderTuples);
        System.out.println("Cached " + orderTuples.size() + " orders for key: " + key);
    }

    private List<OrderRequestDto> mapOrders(Set<Object> rawOrders) {
        // cast objects back to OrderRequestDto
        return rawOrders.stream().map(obj -> (OrderRequestDto) obj).collect(Collectors.toList());
    }
}
