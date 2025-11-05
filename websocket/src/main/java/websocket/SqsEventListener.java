package websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.annotation.SqsListener;
import jakarta.annotation.PreDestroy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;
import websocket.response.OrderDto;
import websocket.response.WebsocketResponse;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import com.google.common.util.concurrent.ThreadFactoryBuilder;
@Component
@Slf4j
public class SqsEventListener {
    private final ObjectMapper objectMapper;
    private final SimpMessagingTemplate messagingTemplate;
    private final ExecutorService executorService;

    public SqsEventListener(
            ObjectMapper objectMapper,
            SimpMessagingTemplate messagingTemplate) {
        this.objectMapper = objectMapper;
        this.messagingTemplate = messagingTemplate;
        // Dedicated thread pool for WebSocket sends
        this.executorService = Executors.newFixedThreadPool(
                10, // Adjust based on your load
                new ThreadFactoryBuilder()
                        .setNameFormat("websocket-sender-%d")
                        .setDaemon(true)
                        .build()
        );
    }

    @SqsListener("btc-orderBook.fifo")
    public void handleOrderEvent(String event) throws JsonProcessingException {
        try {
            Map<String, List<OrderDto>> orderBookMap = objectMapper.readValue(
                    event, new TypeReference<Map<String, List<OrderDto>>>() {
                    }
            );
            List<OrderDto> buyOrders = orderBookMap.get("buyOrders");
            List<OrderDto> sellOrders = orderBookMap.get("sellOrders");
            // Build proper order book
            String asset = extractAsset(buyOrders, sellOrders);
            WebsocketResponse response = new WebsocketResponse(buyOrders, sellOrders);
            JsonNode json = objectMapper.convertValue(response, JsonNode.class);
            System.out.println("ORDERBOOK : " + json);
            messagingTemplate.convertAndSend("/topic/orderBook/" + asset, json);
        } catch (Exception e) {
            log.error("Error processing SQS event", e);
            throw e;
        }
    }

    private String extractAsset(List<OrderDto> buyOrders, List<OrderDto> sellOrders) {
        if (buyOrders != null && !buyOrders.isEmpty() &&
                buyOrders.getFirst() != null &&
                !buyOrders.getFirst().getAsset().isBlank()) {
            return buyOrders.getFirst().getAsset();
        }

        if (sellOrders != null && !sellOrders.isEmpty() &&
                sellOrders.getFirst() != null &&
                !sellOrders.getFirst().getAsset().isBlank()) {
            return sellOrders.getFirst().getAsset();
        }

        return null;
    }

    private void sendWebSocketAsync(String asset, JsonNode json) {
        executorService.submit(() -> {
            try {
                messagingTemplate.convertAndSend("/topic/orderBook/" + asset, json);
                log.debug("Successfully sent order book update for {}", asset);
            } catch (Exception e) {
                log.error("Failed to send WebSocket message for asset: {}", asset, e);
                // Consider implementing a retry mechanism or dead letter queue here
            }
        });
    }
    @PreDestroy
    public void shutdown() {
        log.info("Shutting down WebSocket executor");
        executorService.shutdown();
        try {
            if (!executorService.awaitTermination(30, TimeUnit.SECONDS)) {
                executorService.shutdownNow();
            }
        } catch (InterruptedException e) {
            executorService.shutdownNow();
            Thread.currentThread().interrupt();
        }
    }
}