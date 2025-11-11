package cryptoHub.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.OrderRequestDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sqs.SqsClient;
import software.amazon.awssdk.services.sqs.model.SendMessageRequest;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SqsService {
    private final SqsClient sqsClient;

    public void pushToQueue(OrderRequestDto orders) throws JsonProcessingException {
        try {
            if (orders == null) return;
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonBody = objectMapper.writeValueAsString(orders);
            String queueUrl = "https://sqs.eu-north-1.amazonaws.com/638335486382/unprocessed-orders.fifo";
            String messageGroupId =  "order-" + UUID.randomUUID();
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
