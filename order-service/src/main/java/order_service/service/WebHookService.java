package order_service.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
@Slf4j
public class WebHookService {
    private final Map<String, CopyOnWriteArrayList<SseEmitter>> userEmitters = new ConcurrentHashMap<>();

    private static final long SSE_TIMEOUT = 30 * 60 * 1000L;

    public SseEmitter createEmitter(String userId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT);

        // Add emitter to user's list
        userEmitters.computeIfAbsent(userId, k -> new CopyOnWriteArrayList<>()).add(emitter);
        log.info("SSE emitter created for user: {}. Total connections: {}", userId, userEmitters.get(userId).size());

        // Handle completion
        emitter.onCompletion(() -> {
            log.info("SSE completed for user: {}", userId);
            removeEmitter(userId, emitter);
        });

        // Handle timeout
        emitter.onTimeout(() -> {
            log.info("SSE timeout for user: {}", userId);
            removeEmitter(userId, emitter);
        });

        // Handle errors
        emitter.onError((ex) -> {
            log.error("SSE error for user: {}", userId, ex);
            removeEmitter(userId, emitter);
        });

        // Send initial connection message
        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .data(Map.of(
                            "message", "Connected to order service",
                            "userId", userId,
                            "timestamp", System.currentTimeMillis()
                    )));
        } catch (IOException e) {
            log.error("Error sending initial message to user: {}", userId, e);
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    /**
     * Send data to all connections of a specific user
     */
    public boolean sendToUser(String userId, Map<String, Object> payload) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);

        if (emitters == null || emitters.isEmpty()) {
            log.warn("No active SSE connections for user: {}", userId);
            return false;
        }

        boolean anySent = false;

        for (SseEmitter emitter : emitters) {
            try {
                emitter.send(SseEmitter.event()
                        .name("order_update")
                        .data(payload));
                anySent = true;
                log.info("Data sent to user: {}", userId);
            } catch (IOException e) {
                log.error("Error sending data to user: {}", userId, e);
                removeEmitter(userId, emitter);
            }
        }

        return anySent;
    }

    private void removeEmitter(String userId, SseEmitter emitter) {
        CopyOnWriteArrayList<SseEmitter> emitters = userEmitters.get(userId);
        if (emitters != null) {
            emitters.remove(emitter);
            if (emitters.isEmpty()) {
                userEmitters.remove(userId);
                log.info("All connections closed for user: {}", userId);
            } else {
                log.info("Remaining connections for user {}: {}", userId, emitters.size());
            }
        }
    }
}
