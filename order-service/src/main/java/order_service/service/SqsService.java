package order_service.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import order_service.request.OrderRequestDto;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SqsService {
    private final SqsClient sqsClient;

    public void pushToQueue(List<OrderRequestDto> orders) throws JsonProcessingException {
        try {
            if (orders == null || orders.isEmpty()) return;
            ObjectMapper objectMapper = new ObjectMapper();
            boolean isPendingOrder = orders.size() == 1;
            String jsonBody = objectMapper.writeValueAsString(isPendingOrder ? orders.getFirst() : orders);
            String queueUrl = isPendingOrder ? "https://sqs.eu-north-1.amazonaws.com/638335486382/btc-pending-orders.fifo" : "https://sqs.eu-north-1.amazonaws.com/638335486382/btc-transactions.fifo";
            String messageGroupId = isPendingOrder ? "btc-pending-orders" : "btc-transactions";
            SendMessageRequest request = SendMessageRequest.builder().
                    queueUrl(queueUrl)
                    .messageGroupId(messageGroupId)
                    .messageDeduplicationId(UUID.randomUUID().toString())
                    .messageBody(jsonBody)
                    .build();
            sqsClient.sendMessage(request);
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
