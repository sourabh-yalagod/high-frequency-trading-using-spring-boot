package org.example;


import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;
import com.amazonaws.services.lambda.runtime.events.SQSEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.dto.CacheUserDto;
import org.example.entity.OrderEntity;
import org.example.entity.UserEntity;
import org.example.repository.UserRepository;
import org.example.service.RedisService;
import org.springframework.boot.SpringApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.Optional;


public class StreamLambdaHandler implements RequestHandler<SQSEvent, String> {
    private static ObjectMapper objectMapper;
    private static RedisTemplate<String, Object> redisTemplate;
    private static RedisService redisService;
    private static UserRepository userRepository;
    private static ApplicationContext applicationContext;

    static {
        applicationContext = SpringApplication.run(Application.class);
        redisTemplate = applicationContext.getBean("redisTemplate", RedisTemplate.class);
        userRepository = applicationContext.getBean("userRepository", UserRepository.class);
        objectMapper = new ObjectMapper();
    }

    public String handleRequest(SQSEvent event, Context context) {
        try {
            for (SQSEvent.SQSMessage orderEvent : event.getRecords()) {
                try {
                    OrderEntity orderEntity = objectMapper.readValue(orderEvent.getBody(), OrderEntity.class);
                    Object cache = redisTemplate.opsForValue().get(orderEntity.getUserId());
                    CacheUserDto userCache = objectMapper.convertValue(cache, CacheUserDto.class);
                    if (userCache == null) {
                        System.out.println("User cache Not Found...!");
                        return "";
                    }
                    Optional<UserEntity> user = userRepository.findById(orderEntity.getUserId());
                    if (!user.isPresent()) {
                        System.out.println("User not Found....!");
                        return "";
                    }
                    user.get().setAmount(userCache.getAmount());
                    userRepository.save(user.get());
                    context.getLogger().log("USER : " + user.get());
                } catch (Exception e) {
                    context.getLogger().log("Deserialization error: " + e.getMessage() + "\n");
                }
            }
        } catch (Exception e) {
            context.getLogger().log("Error processing batch: " + e.getMessage() + "\n");
            return "Processing Failed";

        }
        return "User Updated...!";
    }
}