package cryptoHub.webhook;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.model.Event;
import com.stripe.model.Review;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import cryptoHub.dto.ChachUserDto;
import cryptoHub.entity.PaymentEntity;
import cryptoHub.entity.UserEntity;
import cryptoHub.repository.PaymentRepository;
import cryptoHub.repository.UserRepository;
import cryptoHub.service.AuthUserService;
import cryptoHub.service.RedisService;
import cryptoHub.service.UserService;
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
    @Value("${webhook.secrete}")
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
                    Double amount = objectNode.get("amount_total").asDouble() == 0.0 ? objectNode.get("amount_total").asDouble() : objectNode.get("amount_subtotal").asDouble();
                    String email = customerDetails.path("email").asText();
                    UserEntity user = authUserService.loadUserByUsername(email);
                    PaymentEntity paymentEntityObj = PaymentEntity.builder()
                            .sessionId(sessionId)
                            .user(user)
                            .paymentStatus(PaymentStatus.SUCCESS)
                            .amount(amount)
                            .build();
                    PaymentEntity paymentEntity = paymentRepository.save(paymentEntityObj);
                    user.setAmount((user.getAmount() == null ? 0.0 : user.getAmount()) + amount);
                    userRepository.save(user);
                    ChachUserDto chachUser = redisService.getUser(user.getId());
                    if (chachUser == null) {
                        ChachUserDto newCache = ChachUserDto.builder()
                                .userId(user.getId())
                                .amount(amount)
                                .email(email)
                                .isLocked(false)
                                .build();
                        redisService.cacheUser(newCache);
                    } else {
                        chachUser.setAmount(chachUser.getAmount() + paymentEntity.getAmount());
                        redisService.cacheUser(chachUser);
                    }
                }
                break;
        }
        return ResponseEntity.ok("success");
    }
}