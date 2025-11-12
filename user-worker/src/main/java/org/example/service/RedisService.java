package org.example.service;

import lombok.RequiredArgsConstructor;
import org.example.dto.CacheUserDto;
import org.springframework.data.redis.core.RedisTemplate;

import java.util.concurrent.TimeUnit;


@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    public void cacheUser(CacheUserDto user) {
        redisTemplate.opsForValue().set(
                user.getUserId(),
                user,
                10,
                TimeUnit.MINUTES);
    }

    public CacheUserDto getUser(String key) {
        Object cachedUser = redisTemplate.opsForValue().get(key);
        if (cachedUser instanceof CacheUserDto) {
            return (CacheUserDto) cachedUser;
        }
        return null;
    }

    public void removeUser(String userId) {
        redisTemplate.delete(userId);
    }
}