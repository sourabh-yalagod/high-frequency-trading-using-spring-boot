package websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.awspring.cloud.sqs.annotation.SqsListener;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Service;
import websocket.response.OrderDto;
import websocket.response.WebsocketResponse;

import java.util.List;
import java.util.Map;
import java.util.Objects;

@Component
@Slf4j
public class SqsEventListener {
    ObjectMapper objectMapper = new ObjectMapper();

    @SqsListener("btc-orderBook.fifo")
    public void handleOrderEvent(String event) throws JsonProcessingException {
        try {
            Map<String, List<OrderDto>> orderBookMap = objectMapper.readValue(
                    event,
                    new TypeReference<Map<String, List<OrderDto>>>() {
                    }
            );
            List<OrderDto> buyOrders = orderBookMap.get("buyOrders");
            List<OrderDto> sellOrders = orderBookMap.get("sellOrders");
            System.out.println("ORDER : " + buyOrders);
            // Build proper order book
            WebsocketResponse response = new WebsocketResponse(buyOrders, sellOrders);
            JsonNode json = objectMapper.convertValue(response, JsonNode.class);
            System.out.println("✅ Sent order book update: " + json);
        } catch (Exception e) {
            log.error("Error processing SQS event", e);
            throw e;
        }
    }
}