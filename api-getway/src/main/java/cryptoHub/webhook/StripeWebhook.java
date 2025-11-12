package cryptoHub.webhook;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import cryptoHub.dto.CacheUserDto;
import cryptoHub.entity.PaymentEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.PaymentRepository;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.AuthUserService;
import cryptoHub.service.RedisService;
import cryptoHub.types.PaymentStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/stripe")
@RequiredArgsConstructor
public class StripeWebhook {
    @Value("${stripe.webhook.key}")
    private String WEBHOOK_SECRET;
    private final AuthUserService authUserService;
    private final RedisService redisService;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeEvent(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) throws JsonProcessingException {

        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, WEBHOOK_SECRET);
        } catch (Exception e) {
            System.out.println("Webhook signature verification failed: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        }
        switch (event.getType()) {

            case "checkout.session.completed":
                String session = event.getData().toJson();
                if (session != null) {
                    ObjectMapper mapper = new ObjectMapper();
                    JsonNode root = mapper.readTree(session);
                    JsonNode objectNode = root.path("object");
                    String sessionId = objectNode.path("id").asText();
                    JsonNode customerDetails = objectNode.path("customer_details");
                    long amount = (Long) objectNode.get("amount_total").asLong() == 0.0 ? objectNode.get("amount_total").asLong() / 100 : objectNode.get("amount_subtotal").asLong() / 100;
                    String email = customerDetails.path("email").asText();
                    UserEntity user = authUserService.loadUserByUsername(email);
                    CacheUserDto cachedUser = redisService.getUser(user.getId());
                    System.out.println("User Entity : " + user);
                    System.out.println("User cachedUser : " + cachedUser);
                    if (cachedUser == null) {
                        CacheUserDto newCache = CacheUserDto.builder()
                                .userId(user.getId())
                                .amount((double) amount)
                                .email(email)
                                .isLocked(false)
                                .build();
                        redisService.cacheUser(newCache);
                    }
                    PaymentEntity paymentEntityObj = PaymentEntity.builder()
                            .sessionId(sessionId)
                            .user(user)
                            .paymentStatus(PaymentStatus.SUCCESS)
                            .amount((double) amount)
                            .build();
                    PaymentEntity paymentEntity = paymentRepository.save(paymentEntityObj);
                    cachedUser.setAmount(
                            cachedUser.getAmount() == 0.0 || cachedUser.getAmount() == null
                                    ? paymentEntity.getAmount() :
                                    paymentEntity.getAmount() + cachedUser.getAmount());
                    System.out.println("cachedUser : " + cachedUser);
                    user.setAmount(cachedUser.getAmount());
                    redisService.cacheUser(cachedUser);
                    userRepository.save(user);
                    System.out.println("User : " + user.toString());
                }
                break;
        }
        return ResponseEntity.ok("success");
    }
}