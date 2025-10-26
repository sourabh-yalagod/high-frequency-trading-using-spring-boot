package order_service.controller;

import lombok.RequiredArgsConstructor;
import order_service.Response.WebSocketResponseDto;
import order_service.request.OrderRequestDto;
import order_service.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/order")
    public void newOrder(@RequestBody OrderRequestDto payload) throws Exception {
        orderService.process(payload);
    }

    @PostMapping("/order/callback")
    public ResponseEntity<Void> handleCallback(@RequestBody WebSocketResponseDto payload) {
        System.out.println("Webhook received: " + payload);
        return ResponseEntity.ok().build();
    }

}
