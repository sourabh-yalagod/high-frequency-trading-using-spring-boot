package org.example.service;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.example.StreamLambdaHandler;
import org.example.entity.OrderEntity;
import org.example.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;


@Service
@Transactional
public class OrderService {

    @PersistenceContext
    private EntityManager entityManager;


    private final OrderRepository orderRepository = StreamLambdaHandler.orderRepository;

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
                entityManager.clear(); // avoid memory bloat
            }
        }
        entityManager.flush();
        entityManager.clear();
    }
}


