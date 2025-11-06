package org.example;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.entity.OrderEntity;
import org.example.repository.OrderRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import java.util.ArrayList;
import java.util.List;


public class StreamLambdaHandler implements RequestHandler<SQSEvent, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static ApplicationContext applicationContext;
    private static OrderRepository orderRepository;

    static {
        applicationContext = SpringApplication.run(Application.class);
        orderRepository = applicationContext.getBean("orderRepository", OrderRepository.class);
    }

    @Override
    public String handleRequest(SQSEvent event, Context context) {
        try {
            List<OrderEntity> orders = new ArrayList<>();
            for (SQSEvent.SQSMessage orderRecord : event.getRecords()) {
                try {
                    String body = orderRecord.getBody();
                    OrderEntity order = objectMapper.readValue(body, OrderEntity.class);
                    orderRepository.save(order);
                    context.getLogger().log("Order : " + order.toString());
                } catch (Exception e) {
                    context.getLogger().log("Order Record Creation error: " + e.getMessage() + "\n");
                }
            }
        } catch (RuntimeException e) {
            throw new RuntimeException(e);
        }
        return "Order Processed successfully....!";
    }
}