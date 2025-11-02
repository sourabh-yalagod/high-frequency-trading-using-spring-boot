package cryptoHub.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class StripeConfig {
    @Value("${stripe.secrete.key}")
    private String stripeSecreteKey;

    @PostConstruct
    private void init() {
        Stripe.apiKey = stripeSecreteKey;
    }
}
