package org.example.controller;

import lombok.RequiredArgsConstructor;
import org.example.dtos.OrderRequestDto;
import org.example.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class OrderController {
    private final OrderService orderService;

    @PostMapping("/order")
    public void newOrder(@RequestBody OrderRequestDto payload) throws Exception {
        orderService.process(payload);
    }
}


