package cryptoHub.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import cryptoHub.dto.DepositRequestDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deposit")
public class DepositController {
    @PostMapping("/create-session")
    public ResponseEntity<String> createSessionForDeposit(@RequestBody DepositRequestDto payload) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl("http://localhost:5173/success?session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl("http://localhost:5173/cancel")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(payload.getAmount())
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(payload.getName())
                                                                .build())
                                                .build())
                                .build())
                .build();

        Session session = Session.create(params);
        return ResponseEntity.ok(session.getUrl());
    }
}
