package cryptoHub.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import cryptoHub.dto.CacheUserDto;
import cryptoHub.lib.AppConstants;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class RedisService {
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public void cacheUser(CacheUserDto user) {
        redisTemplate.opsForValue().set(
                user.getUserId(),
                user,
                AppConstants.ACCESS_TOKEN_EXPIRY_IN_MINUTES,
                TimeUnit.MINUTES);
    }

    public CacheUserDto getUser(String key) {
        Object cachedUser = redisTemplate.opsForValue().get(key);
        if (cachedUser == null) return null;
        return objectMapper.convertValue(cachedUser, CacheUserDto.class);
    }

    public void removeUser(String userId) {
        redisTemplate.delete(userId);
    }
}
