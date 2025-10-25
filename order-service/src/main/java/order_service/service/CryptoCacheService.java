package order_service.service;

import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import order_service.types.Assets;
import order_service.types.OrderStatus;
import order_service.types.OrderType;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class CryptoCacheService {
    private final RedisTemplate<String, Object> redisTemplate;
    private static final String BTC_BUY_ORDER_KEY = "btc:buy:orders";
    private static final String BTC_SELL_ORDER_KEY = "btc:sell:orders";

    public void cacheBtcBuyOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        try {
            zSetOps.add(BTC_BUY_ORDER_KEY, order, order.getAmount());
        } catch (NumberFormatException e) {
            throw new Exception("Invalid amount for order: " + e.getMessage());
        }
        System.out.println("Cached BTC BUY orders (priority = higher amount first)");
        System.out.println("Current BTC SELL orders in cache (low amount = high priority):");
        Set<Object> ordersInCache = zSetOps.reverseRange(BTC_BUY_ORDER_KEY, 0, -1); // descending order
        if (ordersInCache != null) {
            int i = 1;
            System.out.println("BTC BUY orders (high amount = high priority):");
            for (Object o : ordersInCache) {
                System.out.println(i + ". " + o);
                i++;
            }
        }
    }

    public void cacheBtcSellOrder(OrderRequestDto order) throws Exception {
        ZSetOperations<String, Object> zSetOps = redisTemplate.opsForZSet();
        try {
            zSetOps.add(BTC_SELL_ORDER_KEY, order, order.getAmount());
        } catch (NumberFormatException e) {
            System.err.println("⚠️ Invalid amount for order: " + order);

        }
        Set<Object> ordersInCache = zSetOps.range(BTC_SELL_ORDER_KEY, 0, -1); // ascending order
        System.out.println("Current BTC SELL orders in cache (low amount = high priority):");
        if (ordersInCache != null) {
            int i = 1;
            for (Object o : ordersInCache) {
                System.out.println(i + ". " + o);
                i++;
            }
        }
    }

    public void process() throws Exception {
        List<OrderRequestDto> buyOrders = List.of(
                new OrderRequestDto(Assets.BTC, "user-1", OrderType.BUY, 9900, "url", "0.5", "10", OrderStatus.PENDING),
                new OrderRequestDto(Assets.BTC, "user-2", OrderType.BUY, 7500, "url", "1.0", "10", OrderStatus.PENDING),
                new OrderRequestDto(Assets.BTC, "user-3", OrderType.BUY, 9000, "url", "0.2", "10", OrderStatus.PENDING),
                new OrderRequestDto(Assets.BTC, "user-1", OrderType.BUY, 80000, "url", "0.5", "10", OrderStatus.PENDING)
        );
        for (OrderRequestDto order : buyOrders) {
            cacheBtcBuyOrder(order);
        }
    }
}
