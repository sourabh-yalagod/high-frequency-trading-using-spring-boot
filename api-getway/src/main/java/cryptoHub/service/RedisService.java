package cryptoHub.service;

import cryptoHub.dto.ChachUserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;

    public void cacheUser(ChachUserDto user) {
        redisTemplate.opsForValue().set(user.getUserId(), user);
    }

    public ChachUserDto getUser(String key) {
        Object cachedUser = redisTemplate.opsForValue().get(key);
        if (cachedUser instanceof ChachUserDto) {
            return (ChachUserDto) cachedUser;
        }
        return null;
    }

    public void removeUser(String userId) {
        redisTemplate.delete(userId);
    }
}
