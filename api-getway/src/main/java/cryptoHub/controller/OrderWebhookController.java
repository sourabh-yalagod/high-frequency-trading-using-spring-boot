package cryptoHub.controller;

import cryptoHub.entity.OrderEntity;
import cryptoHub.service.OrderNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Map;
import java.util.concurrent.TimeUnit;

@Slf4j
@RestController
@RequestMapping("/order/webhook")
@RequiredArgsConstructor
@CrossOrigin(
        origins = {"*"},
        methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.OPTIONS}
)
public class OrderWebhookController {

    private final OrderNotificationService orderNotificationService;

    @GetMapping(value = "/subscribe/{userId}/{orderId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribeToOrderUpdates(
            @PathVariable String userId,
            @PathVariable String orderId) {

        SseEmitter emitter = new SseEmitter(TimeUnit.MINUTES.toMillis(5));

        orderNotificationService.addEmitter(userId, orderId, emitter);

        emitter.onCompletion(() -> {
            log.info("Connection completed | UserId: {} | OrderId: {}", userId, orderId);
            orderNotificationService.removeEmitter(userId, orderId, emitter);
        });

        // Handle connection timeout
        emitter.onTimeout(() -> {
            log.info("Connection timeout | UserId: {} | OrderId: {}", userId, orderId);
            orderNotificationService.removeEmitter(userId, orderId, emitter);
        });

        // Handle connection error
        emitter.onError((e) -> {
            log.error("Connection error | UserId: {} | OrderId: {} | Error: {}", userId, orderId, e.getMessage());
            orderNotificationService.removeEmitter(userId, orderId, emitter);
        });

        return ResponseEntity.ok(emitter);
    }

    @CrossOrigin(origins = {""})
    @PostMapping("/{userId}/{orderId}")
    public ResponseEntity<Map<String, Object>> informUser(
            @RequestBody OrderEntity order,
            @PathVariable String userId,
            @PathVariable String orderId) {

        log.info("Webhook received | UserId: {} | OrderId: {} | Status: {}", userId, orderId, order.getStatus());

        int activeConnections = orderNotificationService.getOrderConnectionCount(userId, orderId);
        int totalUserConnections = orderNotificationService.getTotalUserConnectionCount(userId);

        log.info("Connection stats | UserId: {} | OrderId: {} | Active: {} | Total user: {}",
                userId, orderId, activeConnections, totalUserConnections);

        // Send update to all active connections for this order
        orderNotificationService.sendOrderUpdate(userId, orderId, order);

        return ResponseEntity.ok(Map.of(
                "message", "Order update broadcasted",
                "orderId", orderId,
                "userId", userId,
                "activeConnections", activeConnections,
                "totalUserConnections", totalUserConnections,
                "orderStatus", order.getStatus()
        ));
    }

    @PostMapping("/{userId}/broadcast")
    public ResponseEntity<Map<String, Object>> broadcastToAllOrders(
            @RequestBody OrderEntity order,
            @PathVariable String userId) {

        log.info("Broadcast to all orders | UserId: {}", userId);

        int totalConnections = orderNotificationService.getTotalUserConnectionCount(userId);
        orderNotificationService.broadcastToAllUserOrders(userId, order);

        return ResponseEntity.ok(Map.of(
                "message", "Broadcasted to all user orders",
                "userId", userId,
                "totalConnections", totalConnections
        ));
    }

    /**
     * Get service statistics (for debugging/monitoring)
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(orderNotificationService.getStats());
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Webhook service is running ✅");
    }
}