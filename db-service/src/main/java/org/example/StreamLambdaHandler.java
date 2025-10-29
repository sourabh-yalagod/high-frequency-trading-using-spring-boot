package org.example;

import com.amazonaws.serverless.exceptions.ContainerInitializationException;
import com.amazonaws.serverless.proxy.model.AwsProxyRequest;
import com.amazonaws.serverless.proxy.model.AwsProxyResponse;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.entity.OrderEntity;
import org.example.repository.OrderRepository;
import org.example.service.OrderService;
import com.amazonaws.serverless.proxy.spring.SpringBootLambdaContainerHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;

import java.util.ArrayList;
import java.util.List;


public class StreamLambdaHandler implements RequestHandler<SQSEvent, String> {
    private static final ObjectMapper objectMapper = new ObjectMapper();
    private static ApplicationContext applicationContext;
    public static OrderService orderService;
    public static OrderRepository orderRepository;
    @PersistenceContext
    private EntityManager entityManager;
    static {
        applicationContext = SpringApplication.run(Application.class);
        orderService = applicationContext.getBean(OrderService.class);
        orderRepository = applicationContext.getBean(OrderRepository.class);
    }

    @Override
    public String handleRequest(SQSEvent event, Context context) {
        try {
            List<OrderEntity> orders = new ArrayList<>();
            for (SQSEvent.SQSMessage msg : event.getRecords()) {
                try {
                    System.out.println(msg);
                    OrderEntity order = objectMapper.readValue(msg.getBody(), OrderEntity.class);
                    orders.add(order);
                } catch (Exception e) {
                    context.getLogger().log("Deserialization error: " + e.getMessage() + "\n");
                }
            }
            int size = orders.size();
            if (size == 0) {
                context.getLogger().log("No orders to process.\n");
                return "No Orders";
            }
            if (size > 100) {
                context.getLogger().log("High load detected: " + size + " orders\n");
                orderService.saveInBatches(orders, 50);
            } else if (size > 50) {
                context.getLogger().log("Moderate load: " + size + " orders\n");
                orderService.saveInBatches(orders, 25);
            } else {
                context.getLogger().log("Low load: saving individually (" + size + " orders)\n");
                this.saveAllOrders(orders);
            }
            return "Processed Successfully";
        } catch (Exception e) {
            context.getLogger().log("Error processing batch: " + e.getMessage() + "\n");
            return "Processing Failed";

        }
    }

    public void saveAllOrders(List<OrderEntity> orders) {
        orderRepository.saveAll(orders);
    }

    public void saveInBatches(List<OrderEntity> orders, int batchSize) {
        int count = 0;
        for (OrderEntity order : orders) {
            entityManager.persist(order);
            count++;
            if (count % batchSize == 0) {
                entityManager.flush();
                entityManager.clear();
            }
        }
        entityManager.flush();
        entityManager.clear();
    }
}