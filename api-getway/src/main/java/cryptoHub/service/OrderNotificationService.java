package cryptoHub.service;

import cryptoHub.entity.OrderEntity;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
public class OrderNotificationService {

    // Structure: userId -> orderId -> List of Emitters
    // This allows one user to have multiple orders, each with their own connections
    private final Map<String, Map<String, CopyOnWriteArrayList<SseEmitter>>> userOrderEmitters =
            new ConcurrentHashMap<>();

    // Track emitter creation time for timeout management
    private final Map<SseEmitter, Long> emitterCreationTime = new ConcurrentHashMap<>();

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(2);

    private static final long EMITTER_TIMEOUT_MINUTES = 5;

    /**
     * Subscribe to order updates
     * @param userId - User ID
     * @param orderId - Order ID (to support multiple orders per user)
     * @param emitter - SSE emitter
     */
    public void addEmitter(String userId, String orderId, SseEmitter emitter) {
        // Create order map if doesn't exist
        userOrderEmitters.computeIfAbsent(userId, k -> new ConcurrentHashMap<>())
                .computeIfAbsent(orderId, k -> new CopyOnWriteArrayList<>())
                .add(emitter);

        emitterCreationTime.put(emitter, System.currentTimeMillis());

        log.info("✅ Emitter added | UserId: {} | OrderId: {} | Total connections for this order: {}",
                userId, orderId, getOrderConnectionCount(userId, orderId));

        // Schedule automatic cleanup after timeout
        scheduleEmitterCleanup(userId, orderId, emitter);
    }

    /**
     * Remove specific emitter
     */
    public void removeEmitter(String userId, String orderId, SseEmitter emitter) {
        try {
            Map<String, CopyOnWriteArrayList<SseEmitter>> orderMap = userOrderEmitters.get(userId);
            if (orderMap != null) {
                CopyOnWriteArrayList<SseEmitter> emitters = orderMap.get(orderId);
                if (emitters != null) {
                    emitters.remove(emitter);
                    emitterCreationTime.remove(emitter);

                    // Clean up empty order
                    if (emitters.isEmpty()) {
                        orderMap.remove(orderId);
                        log.info("🗑️ Order cleanup | UserId: {} | OrderId: {}", userId, orderId);
                    }

                    // Clean up empty user
                    if (orderMap.isEmpty()) {
                        userOrderEmitters.remove(userId);
                        log.info("🗑️ User cleanup | UserId: {}", userId);
                    }
                }
            }

            // Safely complete emitter
            try {
                emitter.complete();
            } catch (Exception e) {
                log.debug("Emitter already completed");
            }
        } catch (Exception e) {
            log.error("❌ Error removing emitter", e);
        }
    }

    /**
     * Send order update to ALL active connections for a specific order
     * All subscribers to this order get real-time updates
     */
    public void sendOrderUpdate(String userId, String orderId, OrderEntity order) {
        Map<String, CopyOnWriteArrayList<SseEmitter>> orderMap = userOrderEmitters.get(userId);

        if (orderMap == null || orderMap.isEmpty()) {
            log.warn("⚠️ No user found | UserId: {}", userId);
            return;
        }

        CopyOnWriteArrayList<SseEmitter> emitters = orderMap.get(orderId);

        if (emitters == null || emitters.isEmpty()) {
            log.warn("⚠️ No waiting connections | UserId: {} | OrderId: {}", userId, orderId);
            return;
        }

        int successCount = 0;
        List<SseEmitter> failedEmitters = new ArrayList<>();

        // Send to ALL connections for this order
        for (SseEmitter emitter : emitters) {
            try {
                log.info("📤 Sending order update | UserId: {} | OrderId: {} | Status: {}",
                        userId, orderId, order.getStatus());

                emitter.send(SseEmitter.event()
                        .id(UUID.randomUUID().toString())
                        .name("order-update")
                        .data(order)
                        .reconnectTime(1000));

                successCount++;

            } catch (IOException e) {
                log.error("❌ Error sending to emitter | Error: {}", e.getMessage());
                failedEmitters.add(emitter);
            }
        }

        // Clean up failed emitters
        failedEmitters.forEach(emitter -> removeEmitter(userId, orderId, emitter));

        log.info("📊 Broadcast complete | UserId: {} | OrderId: {} | Success: {} | Failed: {}",
                userId, orderId, successCount, failedEmitters.size());
    }

    /**
     * Broadcast update to ALL orders of a user
     * Useful for account-level notifications
     */
    public void broadcastToAllUserOrders(String userId, OrderEntity order) {
        Map<String, CopyOnWriteArrayList<SseEmitter>> orderMap = userOrderEmitters.get(userId);

        if (orderMap == null || orderMap.isEmpty()) {
            log.warn("⚠️ No orders for user | UserId: {}", userId);
            return;
        }

        for (String orderId : orderMap.keySet()) {
            sendOrderUpdate(userId, orderId, order);
        }
    }

    /**
     * Get connection count for specific order
     */
    public int getOrderConnectionCount(String userId, String orderId) {
        Map<String, CopyOnWriteArrayList<SseEmitter>> orderMap = userOrderEmitters.get(userId);
        if (orderMap != null) {
            CopyOnWriteArrayList<SseEmitter> emitters = orderMap.get(orderId);
            return emitters != null ? emitters.size() : 0;
        }
        return 0;
    }

    /**
     * Get total connection count for all user's orders
     */
    public int getTotalUserConnectionCount(String userId) {
        Map<String, CopyOnWriteArrayList<SseEmitter>> orderMap = userOrderEmitters.get(userId);
        if (orderMap != null) {
            return orderMap.values().stream()
                    .mapToInt(List::size)
                    .sum();
        }
        return 0;
    }

    /**
     * Schedule automatic cleanup after timeout
     */
    private void scheduleEmitterCleanup(String userId, String orderId, SseEmitter emitter) {
        scheduler.schedule(() -> {
            try {
                long creationTime = emitterCreationTime.getOrDefault(emitter, System.currentTimeMillis());
                long elapsedMinutes = TimeUnit.MILLISECONDS.toMinutes(
                        System.currentTimeMillis() - creationTime
                );

                if (elapsedMinutes >= EMITTER_TIMEOUT_MINUTES) {
                    log.info("⏱️ Emitter timeout cleanup | UserId: {} | OrderId: {} | Elapsed: {} mins",
                            userId, orderId, elapsedMinutes);
                    removeEmitter(userId, orderId, emitter);
                }
            } catch (Exception e) {
                log.error("Error in scheduled cleanup", e);
            }
        }, EMITTER_TIMEOUT_MINUTES, TimeUnit.MINUTES);
    }

    /**
     * Get detailed stats for debugging
     */
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userOrderEmitters.size());
        stats.put("totalActiveEmitters", emitterCreationTime.size());

        Map<String, Map<String, Integer>> details = new HashMap<>();
        userOrderEmitters.forEach((userId, orderMap) -> {
            Map<String, Integer> orderCounts = new HashMap<>();
            orderMap.forEach((orderId, emitters) -> orderCounts.put(orderId, emitters.size()));
            details.put(userId, orderCounts);
        });
        stats.put("details", details);

        return stats;
    }

    /**
     * Cleanup resources on shutdown
     */
    public void shutdown() {
        scheduler.shutdown();
        try {
            if (!scheduler.awaitTermination(5, TimeUnit.SECONDS)) {
                scheduler.shutdownNow();
            }
        } catch (InterruptedException e) {
            scheduler.shutdownNow();
        }
    }
}