package cryptoHub.controller;

import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import cryptoHub.dto.DepositRequestDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/deposit")
public class DepositController {
    @Value("${frontend.baseurl}")
    private String FRONTEND_BASE_URL;

    @PostMapping("/create-session")
    public ResponseEntity<String> createSessionForDeposit(@RequestBody DepositRequestDto payload) throws StripeException {
        SessionCreateParams params = SessionCreateParams.builder()
                .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(FRONTEND_BASE_URL + "/deposit/" + payload.getUserId() + "?status=success&session_id={CHECKOUT_SESSION_ID}")
                .setCancelUrl(FRONTEND_BASE_URL + "/deposit/" + payload.getUserId() + "?status=failed&session_id={CHECKOUT_SESSION_ID}")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency("usd")
                                                .setUnitAmount(payload.getAmount() * 100)
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
