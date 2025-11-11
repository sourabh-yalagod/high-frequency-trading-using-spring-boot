package org.example;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dtos.OrderRequestDto;
import org.example.service.OrderService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;
import software.amazon.awssdk.services.sqs.SqsClient;


public class StreamLambdaHandler implements RequestHandler<SQSEvent, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static ApplicationContext applicationContext;
    private static OrderService orderService;
    private static SqsClient sqsClient;
    private static RedisTemplate<String, Object> redisTemplate;
    private static OrderUtils orderUtils;

    static {
        SpringApplication app = new SpringApplication(Application.class);
        applicationContext = app.run();
        sqsClient = applicationContext.getBean(SqsClient.class);
        redisTemplate = applicationContext.getBean(RedisTemplate.class);
        orderService = new OrderService(redisTemplate, sqsClient);
        OrderUtils.redisTemplate = redisTemplate;
    }

    @Override
    public String handleRequest(SQSEvent event, Context context) {
        for (SQSEvent.SQSMessage orderRecord : event.getRecords()) {
            String body = orderRecord.getBody();
            try {
                OrderRequestDto order = objectMapper.readValue(body, OrderRequestDto.class);
                orderService.process(order);
            } catch (Exception e) {
                throw new RuntimeException(e);
            }
        }
        return "null";
    }
}