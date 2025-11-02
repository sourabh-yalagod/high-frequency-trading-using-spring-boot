package org.example;
import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import org.example.entity.OrderEntity;
import org.example.repository.OrderRepository;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.transaction.annotation.Transactional;

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
            List<List<OrderEntity>> transactions = new ArrayList<>();
            for (SQSEvent.SQSMessage transactionRecord : event.getRecords()) {
                try {
                    List<OrderEntity> transaction = objectMapper.readValue(transactionRecord.getBody(), new TypeReference<List<OrderEntity>>() {
                    });
                    transactions.add(transaction);
                    context.getLogger().log("TRANSACTION : " + transaction.toString());
                } catch (Exception e) {
                    context.getLogger().log("Deserialization error: " + e.getMessage() + "\n");
                }
            }
            processTransactions(transactions);

        } catch (Exception e) {
            context.getLogger().log("Error processing batch: " + e.getMessage() + "\n");
            return "Processing Failed";

        }
        return "Transaction Executed...!";
    }

    @Transactional
    public void processTransactions(List<List<OrderEntity>> transactions) {
        transactions.forEach(transaction -> orderRepository.saveAll(transaction));
    }
}